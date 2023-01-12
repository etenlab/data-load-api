type Marker = {
  token: string;
  content: (string | Marker)[];
  stringifiedContent: string;
  attributes: { [key: string]: string };
  closed: boolean;
};

function parseUSFMMarkers(input: string) {
  const markers: (string | Marker)[] = [];

  for (const line of input.split('\n')) {
    const newMarkers = getAllContentInLine(line);

    markers.push(...newMarkers);
  }

  return markers;
}

function getFirstMarkerInLine(line: string):
  | {
      marker: Marker;
      startPos: number;
      endPos: number;
    }
  | undefined {
  const openMarkerStart = line.indexOf('\\');
  if (openMarkerStart === -1) {
    return;
  }

  const indexOfOpenMarkerEnd = line.indexOf(' ', openMarkerStart);
  const openMarkerEnd =
    indexOfOpenMarkerEnd === -1 ? line.length : indexOfOpenMarkerEnd;
  const markerToken = line.substring(
    openMarkerStart + 1,
    openMarkerEnd === -1 ? undefined : openMarkerEnd,
  );

  const closeMarkerStart = line.indexOf(`${markerToken}*`, openMarkerEnd);
  const closed = closeMarkerStart !== -1;
  const closeMarkerEnd = closed
    ? closeMarkerStart + markerToken.length + 1
    : line.length;

  const contentStart = openMarkerEnd + 1;
  const contentEnd = closed ? closeMarkerStart : line.length;
  const rawContent = line.substring(contentStart, contentEnd);

  const attributes: { [key: string]: string } = {};
  const attributePattern = /(\w+)="([^"]+)"/g;
  let match: RegExpExecArray | null;
  let hasAttributes = false;
  while (closed && (match = attributePattern.exec(rawContent)) !== null) {
    hasAttributes = true;
    attributes[match[1]] = match[2];
  }

  let childContent = rawContent;

  if (hasAttributes) {
    childContent = rawContent.slice(0, rawContent.indexOf('|'));
  }

  const nestedContent = getAllContentInLine(childContent);

  return {
    marker: {
      token: markerToken,
      attributes,
      closed,
      content: nestedContent,
      stringifiedContent: stringifyContent(nestedContent),
    },
    startPos: openMarkerStart,
    endPos: closeMarkerEnd,
  };
}

function getAllContentInLine(line: string): (Marker | string)[] {
  const markers: (Marker | string)[] = [];

  let lastPostion = 0;

  while (true) {
    if (lastPostion >= line.length) {
      break;
    }

    const restOfLine = line.substring(lastPostion);

    const marker = getFirstMarkerInLine(restOfLine);
    if (!marker) {
      markers.push(restOfLine);
      break;
    }

    const precedingString = line.substring(
      lastPostion,
      lastPostion + marker.startPos,
    );
    precedingString && markers.push();

    markers.push(marker.marker);

    lastPostion += marker.endPos;
  }

  return markers;
}

export function stringifyContent(content: (string | Marker)[]): string {
  return content
    .map((c) => (typeof c === 'string' ? c : stringifyContent(c.content)))
    .join('');
}

export { parseUSFMMarkers, Marker };
