import sys

def setup_console_encoding():
    """Set console encoding to UTF-8"""
    sys.stdout.reconfigure(encoding='utf-8')

def format_timestamp(seconds):
    """
    Format timestamp into clickable format with hours, minutes, and seconds
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}" 