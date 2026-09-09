"""Parse the delivered HTML structure for the dependency-free interaction tests."""
from html.parser import HTMLParser
import json
import sys


class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = {"tag": "body", "attrs": {}, "children": [], "text": ""}
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = {"tag": tag, "attrs": dict(attrs), "children": [], "text": ""}
        self.stack[-1]["children"].append(node)
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        if self.stack[-1]["tag"] == tag:
            self.stack.pop()

    def handle_data(self, data):
        self.stack[-1]["text"] += data


parser = Parser()
with open(sys.argv[1], encoding="utf-8") as file:
    parser.feed(file.read())
print(json.dumps(parser.root))
