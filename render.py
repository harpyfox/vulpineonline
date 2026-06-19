from jinja2 import Environment, select_autoescape, TemplateRuntimeError, TemplateNotFound, TemplateSyntaxError, TemplateError
from jinja2.loaders import FileSystemLoader
import logging
from pathlib import Path
from datetime import datetime
import re
import sys

import json
import ast

def ansi(text: str, code: int) -> str:
    return f"\033[{code:03d}m{text}\033[000m"

class ColourFormatter(logging.Formatter):
    """Formats DEBUG messages as dim, WARNING as yellow, ERROR as red, and CRITICAL as reverse red"""

    # format = "[%(asctime)s] [%(name)s] %(levelname)7s: %(message)s"
    format = "%(message)s"

    FORMATS = {
        logging.DEBUG: ansi(format, 2),
        logging.INFO: format,
        logging.WARNING: ansi(format, 33),
        logging.ERROR: ansi(format, 31),
        logging.CRITICAL: ansi(format, 41),
    }

    def format(self, record: logging.LogRecord):
        fmt = self.FORMATS.get(record.levelno)
        formatter = logging.Formatter(fmt, "%H:%M:%S")
        return formatter.format(record)

class FrontMatterHandler:
    """Splits and parses front matter in a template file"""
    boundary: re.Pattern[str] | None = None
    start_delimiter: str | None = None
    end_delimiter: str | None = None

    def split(self, text: str) -> tuple[str, str]:
        # https://github.com/eyeseast/python-frontmatter/blob/main/frontmatter/default_handlers.py#L281
        _, meta, content = self.boundary.split(text, maxsplit=2)  
        return "{" + meta + "}", content

    def parse(self, metadata: str) -> object:
        raise NotImplementedError

class JSONHandler(FrontMatterHandler):
    boundary = re.compile(r"^(?:{|})$", re.MULTILINE)
    start_delimiter = ""
    end_delimiter = ""

    def parse(self, metadata: str) -> object:
        metadict = json.loads(metadata)
        return metadict


class AstHandler(FrontMatterHandler):
    boundary = re.compile(r"^(?:{|})$", re.MULTILINE)
    start_delimiter = ""
    end_delimiter = ""

    def parse(self, metadata: str) -> object:
        metadict = ast.literal_eval(metadata)
        return metadict


# example filter
def filter_datetime_format(value: datetime, format="%H:%M %y-%m-%d"):
    return value.strftime(format)

def main() -> int:
    loader = FileSystemLoader(TEMPLATE_DIR)
    logger.debug(
f'''initialised FileSystemLoader
    searchpath={TEMPLATE_DIR!r}'''
    )
    
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
    logger.debug(
f'''initialised Environment
    globals={env.globals}
    filters={list(env.filters.keys())}'''
    )

    template_names = loader.list_templates()
    logger.debug(f"{template_names}")
    # logger.info(f"writing {len(template_names)} templates from {TEMPLATE_DIR!r} to {OUTPUT_DIR!r}...")

    success_count = 0
    skip_count = 0
    error_count = 0
    for name in template_names:
        logger.debug(f"parsing {name}")
        if not name.endswith(TEMPLATE_EXT):
            logger.info(ansi(
                f"{name:36} x---- not a template file", 2))
            skip_count += 1
            continue

        try:
            source, path, uptodate = loader.get_source(env, name)
        except UnicodeDecodeError as error:
            logger.error(
                f"{name:36} x---- {error}")
            error_count += 1
            continue
        
        try:
            metadata, content = FRONTMATTER_HANDLER.split(source)
        except ValueError as error:
            logger.info(ansi(
                f"{path:36} =x--- no metadata, treating as abstract", 2))
            skip_count += 1
            continue
        except Exception as error:
            logger.error(
                f"{path:36} =x--- {error} ({type(error)})")
            error_count += 1
            continue
        logger.debug(f"    metadata={metadata}")
        logger.debug(f"    content={content}")

        try:
            metadict = FRONTMATTER_HANDLER.parse(metadata)
        except Exception as error:
            logger.error(
                f"{path:36} ==x-- {error} ({type(error)})")
            error_count += 1
            continue
        logger.debug(f"    metadict={metadict}")
        

        try:
            code = env.compile(content, name, path)
            template = env.template_class.from_code(env, code, compiled_globals, uptodate)
        except Exception as error:
            logger.error(
                f"{path:36} ===x- {error} ({type(error)})")
            error_count += 1
            continue

        try:
            rendered = template.render(metadict)
        except Exception as error:
            logger.error(
                f"{path:36} ====x {error} ({type(error)})")
            error_count += 1
            continue
        
        output_name, ext = name.rsplit(".", 1)
        output_path = Path(OUTPUT_DIR, output_name)
        output_path.parent.mkdir(exist_ok=True, parents=True)
        with open(output_path, "w") as output:
            output.write(rendered)

        logger.info(f"{path:36} ====> {output_path!s}")
        success_count += 1

    written = f"{success_count} written"
    skipped = f"{skip_count} skipped"
    errored = f"{error_count} errors"
    logger.info(f"{written:12} {skipped:12} {errored:12}\n")

    if error_count > 0:
        return 1
    else:
        return 0


LOG_LEVEL = logging.INFO
TEMPLATE_DIR = "templates"
TEMPLATE_EXT = "j2"
OUTPUT_DIR = "public"
GLOBALS = {
    "site": {
        "title": "VULPINE ONLINE",
        "author": "harper fox",
        "domain": "vulpineonline.com",
    }
}
FRONTMATTER_HANDLER: FrontMatterHandler = AstHandler()

logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)
handler = logging.StreamHandler()
handler.setLevel(LOG_LEVEL)
handler.setFormatter(ColourFormatter())
logger.addHandler(handler)


if __name__ == "__main__":
    logger.debug(
f'''vulpineonline page renderer
    LOG_LEVEL={LOG_LEVEL}
    TEMPLATE_DIR={TEMPLATE_DIR}
    TEMPLATE_EXT={TEMPLATE_EXT}
    OUTPUT_DIR={OUTPUT_DIR}
    GLOBALS={GLOBALS}
    FRONTMATTER_HANDLER={FRONTMATTER_HANDLER}'''
    )

    status = main()
    sys.exit(status)
