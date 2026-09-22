import re
import json
import ast


class FrontMatterHandler:
    """Splits and parses front matter in a template file."""

    boundary: re.Pattern[str] | None = None
    start_delimiter: str | None = None
    end_delimiter: str | None = None

    def split(self, text: str) -> tuple[str, str]:
        """Split a chunk of text into metadata and content."""

        # https://github.com/eyeseast/python-frontmatter/blob/main/frontmatter/default_handlers.py#L281

        meta = ""
        content = ""
        splits = self.boundary.split(text, maxsplit=2)

        if len(splits) == 3:
            meta = "{" + splits[1] + "}"
            content = splits[2]

        return meta, content

    def parse(self, metadata: str) -> object:
        """Parse a raw metadata string into a dictionary."""

        raise NotImplementedError


class JSONFrontMatterHandler(FrontMatterHandler):
    boundary = re.compile(r"^(?:{|})$", re.MULTILINE)
    start_delimiter = ""
    end_delimiter = ""

    def parse(self, metadata: str) -> object:
        metadict = json.loads(metadata)
        return metadict


class AstFrontMatterHandler(FrontMatterHandler):
    boundary = re.compile(r"^(?:{|})$", re.MULTILINE)
    start_delimiter = ""
    end_delimiter = ""

    def parse(self, metadata: str) -> object:
        metadict = ast.literal_eval(metadata)
        return metadict
