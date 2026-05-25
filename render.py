from jinja2 import Environment, select_autoescape, TemplateRuntimeError, TemplateNotFound, TemplateSyntaxError
from jinja2.loaders import FileSystemLoader
import logging
from pathlib import Path
from datetime import datetime
import json
import re
import ast
import time
import sys

LOG_LEVEL = logging.INFO

TEMPLATE_DIR = "templates"
OUTPUT_DIR = "public"
GLOBALS = {
    "site": {
        "title": "VULPINE ONLINE",
        "author": "harper fox",
        "domain": "vulpineonline.com",
    }
}

logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)

def ansi(text: str, code: int) -> str:
    return f"\033[{code:03d}m{text}\033[000m";


class ColourFormatter(logging.Formatter):
    """Formats DEBUG messages as dim, WARNING as yellow, ERROR and red, and CRITICAL as reverse red."""
    # format = "[%(asctime)s] [%(name)s] %(levelname)7s: %(message)s"
    format = "%(message)s"

    FORMATS = {
        logging.DEBUG: ansi(format, 2),
        logging.INFO: format,
        logging.WARNING: ansi(format, 33),
        logging.ERROR: ansi(format, 31),
        logging.CRITICAL: ansi(format, 41)
    }

    def format(self, record: logging.LogRecord):
        fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(fmt, "%H:%M:%S")
        return formatter.format(record)



handler = logging.StreamHandler()
handler.setLevel(LOG_LEVEL)
handler.setFormatter(ColourFormatter())
logger.addHandler(handler)

# example filter
def filter_datetime_format(value: datetime, format="%H:%M %y-%m-%d"):
    return value.strftime(format)



def main() -> int:
    loader = FileSystemLoader(TEMPLATE_DIR)
    logger.debug(f"template directory: {TEMPLATE_DIR}")
    template_names = loader.list_templates()
    logger.debug(f"{template_names}")
    logger.info(f"writing {len(template_names)} templates from {TEMPLATE_DIR!r} to {OUTPUT_DIR!r}...")

    env = Environment(
        loader=loader,
        autoescape=select_autoescape(
            enabled_extensions=("html"),
            default_for_string=True,
            default=False
        ),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    env.globals = GLOBALS
    compiled_globals = env.make_globals(None)
    env.filters = {
        "datetime_format": filter_datetime_format,
    }

    logger.debug("initialised environment")
    logger.debug(f"globals: {env.globals}")
    logger.debug(f"filters: {list(env.filters.keys())}")

    success_count = 0
    skip_count = 0
    error_count = 0
    for name in template_names:
        logger.debug(f"parsing {name}")
        try:
            source, path, uptodate = loader.get_source(env, name)
        except UnicodeDecodeError as unicodeError:
            if name == ".DS_Store":
                logger.info(ansi(f"{name:36} =x mac user identified", 2))
            else:
                logger.warning(f"{name:36} =x {str(unicodeError)}")
            skip_count += 1
            continue
        metadata, content = get_metadata(source)
        metadict = parse_metadata_ast(metadata) if metadata else None
        if metadict is None:
            logger.info(ansi(f"{path:36} =x no metadata, treating as abstract", 2))
            skip_count += 1
            continue

        code = env.compile(content, name, path)
        template = env.template_class.from_code(env, code, compiled_globals, uptodate)
        
        try:
            rendered = template.render(metadict)
        except TemplateRuntimeError as runtimeError:
            logger.error(f"{path:36} =x {str(runtimeError)}")
            error_count += 1
            continue
        except TemplateNotFound as notFoundError:
            logger.error(f"{path:36} =x {str(notFoundError)}")
            error_count += 1
            continue;
        except TemplateSyntaxError as syntaxError:
            logger.error(f"{path:36} =x {str(syntaxError)}")
            error_count += 1
            continue;
        else:
            output_path = Path(OUTPUT_DIR, name)
            output_path.parent.mkdir(exist_ok=True, parents=True)
            with open(output_path, "w") as output:
                output.write(rendered)
            logger.info(f"{path:36} => {output_path!s}")
            success_count += 1
    written = f"{success_count} written"
    skipped = f"{skip_count} skipped"
    errored = f"{error_count} errors"
    logger.info(f"\n{written:12} {skipped:12} {errored:12}")
    if error_count >= 0:
        return 1
    else:
        return 0

def get_metadata(text: str) -> tuple[str | None, str]:
    try:
        _, meta, content = re.split(r"^(?:{|})$", text, maxsplit=2, flags=re.MULTILINE) # https://github.com/eyeseast/python-frontmatter/blob/main/frontmatter/default_handlers.py#L281
        return "{"+meta+"}", content
    except ValueError as valueError:
        logger.debug(f"assuming no metadata - {str(valueError)}")
    return None, text

def parse_metadata_json(text: str) -> object:
    try:
        metadata = json.loads(text)
        logger.debug(f"metadata: {metadata}")
        return metadata
    except json.JSONDecodeError as jsonError:
        logger.error(f"metadata parsing error - {str(jsonError)}")
    return {}

def parse_metadata_ast(text: str) -> object:
    try:
        metadata = ast.literal_eval(text)
        logger.debug(f"metadata: {metadata}")
        return metadata
    except (ValueError, TypeError, SyntaxError, MemoryError, RecursionError) as error:
        logger.error(f"metadata parsing error - {str(error)}")
    return {}

if __name__ == "__main__":
    status = main()
    sys.exit(status)
