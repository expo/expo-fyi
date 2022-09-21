const fetch = require('node-fetch');
const urlRegex = require('url-regex');
const mem = require('mem');

module.exports = async (request, response) => {
  const { url } = request;
  const urlParts = url.split("/");
  let redirectUrl;

  if (urlParts.length === 3 && (urlParts[1] === 'r' || urlParts[1] === 'redirect')) {
    try {
      const code = removeWeirdWindowsThing(removeQueryParam(urlParts[2]));
      redirectUrl = await memGetRedirectUrl(code);
    } catch (e) {
      console.log(e);
    }
  } else if (urlParts === 2) {
    const code = removeWeirdWindowsThing(removeQueryParam(urlParts[1]));
    const name = remapOldNames(removeMdExtension(code));
    redirectUrl = `https://github.com/expo/fyi/blob/main/${name}.md`;
  }

  response.writeHead(302, {
    Location: redirectUrl ?? `https://github.com/expo/fyi`,
  });

  response.end();
  return;
};

// Fetch redirext from the redirects directory within the fyi repo
async function getRedirectUrl(code) {
  const result = await fetch(`https://raw.githubusercontent.com/expo/fyi/main/redirects/${code}`);
  const text = await result.text();
  if (result.status === 200 && urlRegex({ exact: true }).test(text)) {
    return text;
  } else {
    console.log(`Invalid response: ${text}`)
    return null;
  }
}

// Invalidate hourly so we don't have to re-deploy this server usually
const memGetRedirectUrl = mem(getRedirectUrl, { maxAge: 1000 * 60 * 60 })

// Remap names if needed
function remapOldNames(name) {
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
