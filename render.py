from jinja2 import Environment, select_autoescape, TemplateRuntimeError
from jinja2.loaders import FileSystemLoader
import logging
from pathlib import Path
from datetime import datetime
import json
import re
import ast

LOG_LEVEL = logging.INFO
LOG_FORMAT = "%(name)s:%(levelname)s: %(message)s"
TEMPLATE_DIR = "templates"
OUTPUT_DIR = "public"
GLOBALS = {
    "site": {
        "title": "VULPINE ONLINE",
        "author": "harper fox",
        "domain": "vulpineonline.com",
    }
}

logging.basicConfig(format=LOG_FORMAT, level=LOG_LEVEL)
logger = logging.getLogger(__name__)

# example filter
def filter_datetime_format(value: datetime, format="%H:%M %y-%m-%d"):
    return value.strftime(format)

def main():
    loader = FileSystemLoader(TEMPLATE_DIR)
    logger.debug(f"template directory: {TEMPLATE_DIR}")
    template_names = loader.list_templates()
    logger.debug(f"{template_names}")
    logger.info(f"found {len(template_names)} templates in \"{TEMPLATE_DIR}\"!")

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

    logger.debug(f"initialised environment")
    logger.debug(f"globals: {env.globals}")
    logger.debug(f"filters: {list(env.filters.keys())}")

    for name in template_names:
        logger.debug(f"parsing {name}")
        source, path, uptodate = loader.get_source(env, name)
        metadata, content = get_metadata(source)
        metadict = parse_metadata_ast(metadata) if metadata else None
        if metadict is None:
            logger.info(f"skipped {path} - no metadata, treating as abstract")
            continue

        code = env.compile(content, name, path)
        template = env.template_class.from_code(env, code, compiled_globals, uptodate)
        
        try:
            rendered = template.render(metadict)
        except TemplateRuntimeError as runtimeError:
            logger.warning(f"skipped {path} - {str(runtimeError)}")
            continue
        else:
            output_path = Path(OUTPUT_DIR, name)
            output_path.parent.mkdir(exist_ok=True, parents=True)
            with open(output_path, "w") as output:
                output.write(rendered)
            logger.info(f"wrote {path} to {output_path}")
    logger.debug(f"done")

def get_metadata(text: str) -> tuple[str | None, str]:
    try:
        _, meta, content = re.split(r"^(?:{|})$", text, maxsplit=2, flags=re.MULTILINE) # https://github.com/eyeseast/python-frontmatter/blob/main/frontmatter/default_handlers.py#L281
        return "{"+meta+"}", content
    except ValueError as valueError:
        logger.debug(f"assuming no metadata - {str(valueError)}")
    return None, text

def parse_metadata(text: str) -> object:
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
    main()
