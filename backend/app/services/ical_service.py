import requests
from icalendar import Calendar as iCalendar
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
from dateutil import rrule
from dateutil.tz import tzutc
import pytz

logger = logging.getLogger(__name__)

class ICalService:
    @staticmethod
    def normalize_datetime(dt) -> datetime:
        """Normalize datetime to ensure it's timezone-aware"""
        if isinstance(dt, datetime):
            if dt.tzinfo is None:
                # If naive datetime, assume UTC
                return pytz.UTC.localize(dt)
            else:
                # If already timezone-aware, convert to UTC
                return dt.astimezone(pytz.UTC)
        else:
            # If it's a date, convert to datetime at midnight UTC
            return pytz.UTC.localize(datetime.combine(dt, datetime.min.time()))
    
    @staticmethod
    async def fetch_ical_data(url: str) -> Optional[str]:
        """Fetch iCal data from URL"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logger.error(f"Error fetching iCal data from {url}: {str(e)}")
            return None

    @staticmethod
    async def parse_ical_data(ical_data: str, calendar_id: int) -> List[Dict[str, Any]]:
        """Parse iCal data and convert to our event format"""
        events = []
        
        try:
            calendar = iCalendar.from_ical(ical_data)
            
            for component in calendar.walk():
                if component.name == "VEVENT":
                    # Extract basic event info
                    event = {
                        "calendar_id": calendar_id,
                        "title": str(component.get('summary', 'No Title')),
                        "description": str(component.get('description', '')),
                        "location": str(component.get('location', '')),
                        "uid": str(component.get('uid', '')),
                    }
                    
                    # Handle start and end times
                    dtstart = component.get('dtstart')
                    if dtstart:
                        # Check if it's a date (all-day event) or datetime
                        event["all_day"] = not isinstance(dtstart.dt, datetime)
                        # Normalize the datetime to ensure timezone consistency
                        event["start_time"] = ICalService.normalize_datetime(dtstart.dt)
                    else:
                        continue  # Skip events without start time
                    
                    dtend = component.get('dtend')
                    if dtend:
                        event["end_time"] = ICalService.normalize_datetime(dtend.dt)
                    else:
                        # If no end time, use start time + 1 hour or start date + 1 day
                        if event["all_day"]:
                            event["end_time"] = event["start_time"] + timedelta(days=1)
                        else:
                            event["end_time"] = event["start_time"] + timedelta(hours=1)
                    
                    # Handle recurring events (basic implementation)
                    rrule_val = component.get('rrule')
                    if rrule_val:
                        try:
                            # For simplicity, we'll expand recurring events for the next 3 months
                            now = datetime.now(pytz.UTC)
                            until = now + timedelta(days=90)
                            
                            # Get the rrule string and modify UNTIL values to be UTC if needed
                            rrule_str = rrule_val.to_ical().decode('utf-8')
                            
                            # Create a rule
                            rule = rrule.rrulestr(
                                rrule_str,
                                dtstart=event["start_time"]
                            )
                            
                            # Get all occurrences
                            occurrences = rule.between(now, until)
                            
                            # Create an event for each occurrence
                            for occurrence in occurrences:
                                recurrence_event = event.copy()
                                duration = event["end_time"] - event["start_time"]
                                # Ensure occurrence is timezone-aware
                                normalized_occurrence = ICalService.normalize_datetime(occurrence)
                                recurrence_event["start_time"] = normalized_occurrence
                                recurrence_event["end_time"] = normalized_occurrence + duration
                                recurrence_event["uid"] = f"{event['uid']}_{normalized_occurrence.isoformat()}"
                                events.append(recurrence_event)
                        except Exception as rrule_error:
                            # If there's an issue with recurring events, just add the base event
                            logger.warning(f"Error processing recurring event {event.get('uid', 'unknown')}: {str(rrule_error)}")
                            events.append(event)
                    else:
                        events.append(event)
            
            return events
        except Exception as e:
            logger.error(f"Error parsing iCal data: {str(e)}")
            return []

    @staticmethod
    async def fetch_and_parse_calendar(url: str, calendar_id: int) -> List[Dict[str, Any]]:
        """Fetch and parse iCal data for a calendar"""
        ical_data = await ICalService.fetch_ical_data(url)
        if not ical_data:
            return []
        
        return await ICalService.parse_ical_data(ical_data, calendar_id)
