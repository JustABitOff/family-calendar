import requests
from icalendar import Calendar as iCalendar
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
from dateutil import rrule
from dateutil.tz import tzutc

logger = logging.getLogger(__name__)

class ICalService:
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
                        event["start_time"] = dtstart.dt
                        # Check if it's a date (all-day event) or datetime
                        event["all_day"] = not isinstance(dtstart.dt, datetime)
                    else:
                        continue  # Skip events without start time
                    
                    dtend = component.get('dtend')
                    if dtend:
                        event["end_time"] = dtend.dt
                    else:
                        # If no end time, use start time + 1 hour or start date + 1 day
                        if event["all_day"]:
                            event["end_time"] = event["start_time"] + timedelta(days=1)
                        else:
                            event["end_time"] = event["start_time"] + timedelta(hours=1)
                    
                    # Convert date to datetime for database consistency if all-day event
                    if event["all_day"]:
                        if not isinstance(event["start_time"], datetime):
                            event["start_time"] = datetime.combine(event["start_time"], datetime.min.time())
                        if not isinstance(event["end_time"], datetime):
                            event["end_time"] = datetime.combine(event["end_time"], datetime.min.time())
                    
                    # Handle recurring events (basic implementation)
                    rrule_val = component.get('rrule')
                    if rrule_val:
                        # For simplicity, we'll expand recurring events for the next 3 months
                        now = datetime.now(tzutc())
                        until = now + timedelta(days=90)
                        
                        # Create a rule
                        rule = rrule.rrulestr(
                            rrule_val.to_ical().decode('utf-8'),
                            dtstart=event["start_time"]
                        )
                        
                        # Get all occurrences
                        occurrences = rule.between(now, until)
                        
                        # Create an event for each occurrence
                        for occurrence in occurrences:
                            recurrence_event = event.copy()
                            duration = event["end_time"] - event["start_time"]
                            recurrence_event["start_time"] = occurrence
                            recurrence_event["end_time"] = occurrence + duration
                            recurrence_event["uid"] = f"{event['uid']}_{occurrence.isoformat()}"
                            events.append(recurrence_event)
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
