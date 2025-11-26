from jinja2 import Environment, select_autoescape, TemplateRuntimeError
from jinja2.loaders import FileSystemLoader
import logging
from pathlib import Path
from datetime import datetime
import json
import re

LOG_LEVEL = logging.INFO
TEMPLATE_DIR = "templates"
OUTPUT_DIR = "public"

logging.basicConfig(level=LOG_LEVEL)
logger = logging.getLogger(__name__)

def split_template(text: str):
    # exp = re.compile(r"^(?:{|})$", ) # https://github.com/eyeseast/python-frontmatter/blob/main/frontmatter/default_handlers.py#L281
    try:
        _, meta, content = re.split(r"^(?:{|})$", text, maxsplit=2, flags=re.MULTILINE)
        metadata = json.loads("{"+meta+"}")
        logger.debug(f"metadata: {metadata}")
        return metadata, content
    except ValueError as valueError:
        logger.debug(f"assuming no metadata - {str(valueError)}")
        return {}, text

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
    )
    env.globals = {
        "happy": True,
    }
    compiled_globals = env.make_globals(None)
    env.filters = {
        "datetime_format": filter_datetime_format,
    }

    logger.debug(f"initialised environment")
    logger.debug(f"globals: {env.globals}")
    logger.debug(f"filters: {list(env.filters.keys())}")

    for template_name in template_names:
        logger.debug(f"parsing {template_name}")
        template_source, template_path, uptodate = loader.get_source(env, template_name)
        template_metadata, template_content = split_template(template_source)

        code = env.compile(template_content, template_name, template_path)
        template = env.template_class.from_code(env, code, compiled_globals, uptodate)
        
        try:
            rendered = template.render(template_metadata)
        except TemplateRuntimeError as runtimeError:
            logger.warning(f"skipped {template_path} - {str(runtimeError)}")
            continue
        else:
            output_path = Path(OUTPUT_DIR, template_name)
            output_path.parent.mkdir(exist_ok=True, parents=True)
            with open(output_path, "w") as output:
                output.write(rendered)
            logger.info(f"wrote {template_path} to {output_path}")
    logger.debug(f"done")

if __name__ == "__main__":
    main()
