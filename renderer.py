from jinja2 import Environment, select_autoescape, TemplateRuntimeError
from jinja2.loaders import FileSystemLoader
import logging
from pathlib import Path
from datetime import datetime

LOG_LEVEL = logging.INFO
TEMPLATE_DIR = "templates"
OUTPUT_DIR = "public"

# example filter
def filter_datetime_format(value: datetime, format="%H:%M %y-%m-%d"):
    return value.strftime(format)

def main():
    logging.basicConfig(level=LOG_LEVEL)
    logger = logging.getLogger(__name__)

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
    env.filters = {
        "datetime_format": filter_datetime_format,
    }

    logger.debug(f"initialised environment")
    logger.debug(f"globals: {env.globals}")
    logger.debug(f"filters: {list(env.filters.keys())}")

    for template_name in template_names:
        template = env.get_template(template_name)
        output_path = Path(OUTPUT_DIR, template_name)
        output_path.parent.mkdir(exist_ok=True, parents=True)

        try:
            rendered = template.render({
                "key": "value",
            })
        except TemplateRuntimeError as runtimeError:
            logger.warning(f"skipped {Path(TEMPLATE_DIR, template_name)} - {str(runtimeError)}")
        else:
            with open(output_path, "w") as output:
                output.write(rendered)
            logger.info(f"wrote {Path(TEMPLATE_DIR, template_name)} to {output_path}")
        
    logger.debug(f"done")



if __name__ == "__main__":
    main()
