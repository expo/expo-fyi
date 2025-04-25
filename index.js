const fetch = require('node-fetch');
const urlRegex = require('url-regex');
const mem = require('mem');

module.exports = async (request, response) => {
  const { url } = request;
  const urlParts = url.split("/");
  let redirectUrl;

  // This is cached
  const redirects = await memFetchRedirectsListAsync();

  if ((urlParts.length === 3 && (urlParts[1] === 'r' || urlParts[1] === 'redirect')) ||
    redirects.includes(urlParts[1])) {

    try {
      const destination = urlParts.length === 3 ? urlParts[2] : urlParts[1];
      const code = removeWeirdWindowsThing(removeQueryParam(destination));
      redirectUrl = await memGetRedirectUrlAsync(code);
    } catch (e) {
      console.log(e);
    }
  } else if (urlParts.length === 2 && urlParts[1] !== '' && urlParts[1] !== '/') {
    const destination = urlParts[1];
    const code = removeWeirdWindowsThing(removeQueryParam(destination));
    const name = remapOldNames(removeMdExtension(code));
    redirectUrl = `https://github.com/expo/fyi/blob/main/${name}.md`;
  }

  response.writeHead(302, {
    Location: redirectUrl ?? `https://github.com/expo/fyi`,
  });

  response.end();
  return;
};

async function fetchRedirectsListAsync() {
  const repo = "expo/fyi";
  const path = "redirects";
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    console.error(`Error: ${response.status}`);
    return [];
  }

  const files = await response.json();
  const fileNames = files.map(file => file.name);

  return fileNames;
}

// Fetch redirext from the redirects directory within the fyi repo
async function getRedirectUrlAsync(code) {
  const result = await fetch(`https://raw.githubusercontent.com/expo/fyi/main/redirects/${code}`);
  const text = await result.text();
  if (result.status === 200 && urlRegex({ exact: true }).test(text)) {
    return text;
  } else {
    console.log(`Invalid response: ${text}`)
    return null;
  }
}

// Invalidate every 5 minutes, so we don't have to re-deploy this server usually
const memGetRedirectUrlAsync = mem(getRedirectUrlAsync, { maxAge: 1000 * 5 * 60 })
const memFetchRedirectsListAsync = mem(fetchRedirectsListAsync, { maxAge: 1000 * 5 * 60 })

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
