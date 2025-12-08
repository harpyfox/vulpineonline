'''
parse a HTML file for <img> and <video> tags and print the result to stdout.
'''
import sys
import argparse
from html.parser import HTMLParser
from pathlib import Path

class MediaExtractor(HTMLParser):
    extracted: list[dict] = []
    current_tag = ""

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        d = None
        if tag in ('img', 'video'):
            d = {}
            clas = None
            for attr in attrs:
                if "src" in attr:
                    d[tag] = attr[1]
                if "class" in attr:
                    clas = attr[1]
            if clas:
                d["class"] = clas # want img and video first
        if d:
            self.extracted.append(d)

    def handle_data(self, data):
        # this aint pretty but it does the job
        if self.current_tag == "figcaption":
            self.extracted[-1]["caption"] = data

    def handle_endtag(self, tag):
        self.current_tag = None

    def dump(self):
        return self.extracted
    
    def dumps(self):
        for entry in self.extracted:
            line = "{ "
            for i in entry.items():
                line += f"\"{i[0]}\": \"{i[1]}\", "
            line += "},"

            print(line)
        
def main(input_path: str):
    input = None
    try:
        with open(input_path, "r") as input_stream:
            input = input_stream.read()
    except FileNotFoundError as fileError:
        sys.exit(str(fileError))

    if input:
        parser = MediaExtractor()
        parser.feed(input)
        parser.dumps()
    else:
        sys.exit(f"couldnt read from {input_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("filename", type=Path, help="path to source HTML file")
    args = parser.parse_args()
    main(args.filename)