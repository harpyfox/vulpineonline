import logging
import traceback

def ansi(text: str, code: int) -> str:
    return f"\033[{code:03d}m{text}\033[000m"


class ColourFormatter(logging.Formatter):
    """Formats DEBUG messages as dim, WARNING as yellow, ERROR as red, and CRITICAL as reverse red."""

    _levelToColour = {
        logging.CRITICAL: ansi("{}", 41),
        logging.ERROR: ansi("{}", 31),
        logging.WARNING: ansi("{}", 33),
        logging.INFO: "{}",
        logging.DEBUG: ansi("{}", 2),
    }

    def colorize(self, level, message) -> str:
        colour = self._levelToColour.get(level)
        return colour.format(message)

    def formatException(self, ei):
        lines = traceback.format_exception(ei[0], ei[1], ei[2], colorize=True)
        lines.reverse()
        lines.pop(len(lines) - 1)  # dont care about traceback line
        return "".join(lines)

    def formatMessage(self, record: logging.LogRecord):
        msg = self._style.format(record)
        return self.colorize(record.levelno, msg)
