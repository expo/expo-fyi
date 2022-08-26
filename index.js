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
  const name = maybeRedirect(removeMdExtension(code));

  response.writeHead(302, {
    Location: `https://github.com/expo/fyi/blob/main/${name}.md`,
  });

  response.end();
};

// Remap names if needed
function maybeRedirect(name) {
  if (name === 'LegacyNotifications-to-ExpoNotifications') {
    return 'legacy-notifications-to-expo-notifications';
  }

  return name;
}

function removeQueryParam(text) {
  return text.split("?")[0];
}

function removeWeirdWindowsThing(text) {
  return text.replace("%E2%80%8B", "");
}

function removeMdExtension(text) {
  return text.replace(/\.md$/, "");
}
