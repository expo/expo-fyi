module.exports = (request, response) => {
  const { url } = request;
  const urlParts = url.split("/");

  if (url === "/") {
    response.writeHead(302, {
      Location: `https://github.com/expo/fyi`,
    });

    response.end();
    return;
  }

  if (urlParts.length > 2) {
    // who cares? try anyways
  }

  const code = removeWeirdWindowsThing(removeQueryParam(urlParts[1]));

  response.writeHead(302, {
    Location: `https://github.com/expo/fyi/blob/master/${removeMdExtension(code)}.md`,
  });

  response.end();
};

function removeQueryParam(text) {
  return text.split("?")[0];
}

function removeWeirdWindowsThing(text) {
  return text.replace("%E2%80%8B", "");
}

function removeMdExtension(text) {
  return text.replace(/\.md$/, "");
}
