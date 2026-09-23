import sys
import logging
from colour import ColourFormatter, ansi
from frontmatter import AstFrontMatterHandler
from jinja2 import Template, Environment, select_autoescape
from jinja2.loaders import FileSystemLoader
from pathlib import Path, PurePath
from datetime import datetime

class TemplateMetadata(dict):
    # required fields
    title: str
    description: str
    date: datetime
    tags: list[str]

    # optional fields
    image: str = "img/thumbnail.png"
    icon: str = "img/icon.png"
    roles: list[str] = None
    client: str = None

    # generated fields
    template_path: Path
    output_path: Path
    href: str

def load(env: Environment, name: str, compiled_globals) -> (Template, dict):
    """Load a template and its metadata by name."""

    # logger.debug(f"load {env}, {name}, {compiled_globals}")
    
    if not name.endswith(TEMPLATE_EXT):
        # logger.debug(f"{name:36} -- not a template file\n")
        return (None, None)

    logger.debug(f"\nload {name=}\n")

    source, filename, uptodate = env.loader.get_source(env, name)
    metadata_raw, content_raw = FRONTMATTER_HANDLER.split(source)
    # logger.debug(f"{metadata_raw=}\n")
    # logger.debug(f"{content_raw=}\n")

    if metadata_raw == "":
        logger.info(f"{filename!s:33} {ansi("no metadata, treating as abstract", 2)}\n")
        return (None, None)

    metadata: dict = FRONTMATTER_HANDLER.parse(metadata_raw)

    metadata.setdefault("image", TemplateMetadata.image)
    metadata.setdefault("icon", TemplateMetadata.icon)

    template_path = Path(filename)
    output_path = Path(filename.removesuffix("." + TEMPLATE_EXT))
    metadata["template_path"] = template_path
    metadata["output_path"] = output_path

    href = PurePath("/", output_path.relative_to(ROOT_DIR))
    if output_path.name == "index.html":
        href = href.parent
    href_str = str(href)
    if href.name != "":
        href_str = href_str + "/" # add trailing slash to folder index files
    metadata["href"] = href_str
    
    logger.debug(f"{metadata=!r}\n")

    code = env.compile(content_raw, name, filename)
    template = env.template_class.from_code(env, code, compiled_globals, uptodate)
    logger.debug(f"{template=}\n")

    return template, metadata


def render(template: Template, path: Path, args: dict):
    """Render template and write it to path."""

    logger.debug(f"render {template=} {path=} \n")
    rendered = template.render(args)
    path.parent.mkdir(exist_ok=True, parents=True)
    with open(path, "w") as output:
        output.write(rendered)



def main() -> int:

    env = Environment(
        loader= FileSystemLoader(TEMPLATE_DIR),
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
    env.filters.update(custom_filters)
    env.tests.update(custom_tests)

    logger.debug(
f"""initialised Environment
    {env.loader=}
    {env.globals=}
    {list(env.filters.keys())=}
    {list(env.tests.keys())=}\n""")

    template_names: list[str] = env.loader.list_templates()
    logger.debug(f"{template_names=}\n")

    index: dict[Template, dict] = {}
    success_count = 0
    skip_count = 0
    error_count = 0

    logger.info(f"{"template_path"!s:33} {ansi(f"{"output_path"!s:30}", 32)}  {ansi("href", 36)}\n")
    for template_name in template_names:
        try:
            template, metadata = load(env, template_name, compiled_globals)
            if template is None or metadata is None:
                skip_count += 1
            else:
                index[template] = metadata
        except Exception as error:
            logger.error(f"{template_name!s} parsing error {error}", exc_info=True)
            error_count += 1
    # logger.debug(f"{index=}\n")

    index_values = []
    for k, v in index.items():
        index_values.append(v)
    
    for (template, metadata) in index.items():
        try:
            source = metadata["template_path"]
            dest = metadata["output_path"]
            render(template, dest, metadata | {"index":index_values})
            href = metadata["href"]
            logger.info(f"{source!s:33} {ansi(f"{dest!s:30} ", 32)} {ansi(f"{href!s}", 36)}\n")
            success_count += 1
        except Exception as error:
            logger.error(f"{source!s:33} rendering error {error}", exc_info=True)
            error_count += 1

    logger.info(f"{success_count:4} written {error_count:4} errors {ansi(f"{skip_count:4} skipped", 2)}\n")

    if error_count > 0:
        return 1
    else:
        return 0


LOG_LEVEL = logging.INFO
# LOG_LEVEL = logging.DEBUG

GLOBALS: dict = {
    "site": {
        "title": "VULPINE ONLINE",
        "author": "harper fox",
        "domain": "vulpineonline.com",
        "canonical": "https://www.vulpineonline.com",
        "version": (2, 0, 1),
    },
    "renderer": {
        "root_dir": "public/", 
        "template_dir": "public/", 
        "template_ext": "j2",
        "timestamp": -1 
    }
}
ROOT_DIR: str = GLOBALS["renderer"]["root_dir"]
"""Root directory of the site. Rendered templates are placed here."""
TEMPLATE_DIR: str = GLOBALS["renderer"]["template_dir"]
"""Renderer will look here for template files. Can be the same as ROOT_DIR."""
TEMPLATE_EXT: str = GLOBALS["renderer"]["template_ext"]
"""Ignore files that don't have this extension when searching for templates."""

def filter_pathjoin(s, b):
    p = Path(s, b)
    return p



custom_filters = {
    "pathjoin": filter_pathjoin,
}

def test_has_tag(value: list[str], tag: str):
    return tag in value


custom_tests = {
    "hastag": test_has_tag,
}



FRONTMATTER_HANDLER = AstFrontMatterHandler()

logger = logging.getLogger(__name__)
logger.setLevel(LOG_LEVEL)
handler = logging.StreamHandler()
handler.setLevel(LOG_LEVEL)
formatter = ColourFormatter(fmt="%(message)s", datefmt="%H:%M:%S")
handler.setFormatter(formatter)
handler.terminator = ''
logger.addHandler(handler)

if __name__ == "__main__":

    now = datetime.now()
    timestamp = int(now.timestamp())
    GLOBALS["renderer"]["timestamp"] = timestamp

    logger.debug(
        f"""vulpineonline page renderer
    {LOG_LEVEL=}
    {ROOT_DIR=}
    {TEMPLATE_DIR=}
    {TEMPLATE_EXT=}
    {GLOBALS=}
    {FRONTMATTER_HANDLER=}\n""")

    status = main()
    sys.exit(status)
