
const warmupRequests = new Map();
const warmupResults = new Map();

// Resolve the same venue-specific endpoints used by AIChatPage.js.
export const getAIEndpoint = (venue) => {
  const endpoints = {
    Qantum:
      'https://qantumdemoaireportingviperapi.gentlehill-ca974cf4.australiaeast.azurecontainerapps.io/api/airesponse',

    MaxGaming:
      'https://qantumdemoaireportingviperapi.gentlehill-ca974cf4.australiaeast.azurecontainerapps.io/api/airesponse',

    Manly:
      'https://mhbcviperaireportingapi.victoriouswater-d292e9e7.australiaeast.azurecontainerapps.io/api/airesponse',

    StarReward:
      'https://aireportingviperapi.wonderfulglacier-1e6957c7.australiaeast.azurecontainerapps.io/api/airesponse',

    Queens:
      'https://queensgladstoneviperapi.salmonforest-41ebf4b3.australiaeast.azurecontainerapps.io/api/airesponse',

    Hogan:
      'https://wellingtonhotelviperapi.greenbay-34e5b870.australiaeast.azurecontainerapps.io/api/airesponse',

    Brisbane:
      'https://brisbanebrewingviperapi.graymushroom-2c8b9797.australiaeast.azurecontainerapps.io/api/airesponse',

    Central:
      'https://centrallanehotelviperapi.grayflower-1f643a2b.australiaeast.azurecontainerapps.io/api/airesponse',

    Montauk:
      'https://montauktavernviperapi.happyhill-26c14243.australiaeast.azurecontainerapps.io/api/airesponse',

    North:
      'https://northshoretavernviperapi.victoriousfield-ed93b82c.australiaeast.azurecontainerapps.io/api/airesponse',

    Bluewater:
      'https://bluewaterbargrillviperapi.happyplant-a0031ba2.australiaeast.azurecontainerapps.io/api/airesponse',

    Flinders:
      'https://flindersstreetwharvesviperapi.grayglacier-b50c2543.australiaeast.azurecontainerapps.io/api/airesponse',

    Drinks:
      'https://drinkshqviperapi.greenground-e372bb60.australiaeast.azurecontainerapps.io/api/airesponse',

    Woollahra:
      'https://woollahrahotelviperapi.purpleriver-5e2beaca.australiaeast.azurecontainerapps.io/api/airesponse',

    EDP:
      'https://edpviperaireportingapi.thankfulground-1eebdf61.australiaeast.azurecontainerapps.io/api/airesponse',

    Mosaic:
      'https://mosaichotelviperapi.whitebush-141b5257.australiaeast.azurecontainerapps.io/api/airesponse',

    Bob:
      'https://bobsbulkboozeviperapi.icydune-145d42ab.australiaeast.azurecontainerapps.io/api/airesponse',

    Wonthaggi:
      'https://wonthaggicountryclubviperapi.happystone-82db7873.australiaeast.azurecontainerapps.io/api/airesponse',

    Sense:
      'https://sensoftasteviperapi.blackisland-4d6cc168.australiaeast.azurecontainerapps.io/api/airesponse',

    Mannum:
      'https://mannumclubviperapi.bravepebble-efe42685.australiaeast.azurecontainerapps.io/api/airesponse',
  };

  return endpoints[venue] || null;
};

// Keep the request specific to the current venue and username.
const getCacheKey = (venue, username) =>
  `${venue}::${username}`;

// Start the initial AI request, or reuse an existing request.
export const startAIWarmup = (venue, username) => {
  const key = getCacheKey(venue, username);

  if (warmupRequests.has(key)) {
    return warmupRequests.get(key);
  }

  const endpoint = getAIEndpoint(venue);

  if (!endpoint) {
    console.error('No AI endpoint configured for venue:', venue);
    return Promise.resolve(null);
  }

  const history = [
    {
      role: 'user',
      content: 'Hi',
    },
  ];

  const request = fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_history: [],
      prompt: 'Hi',
      username,
    }),
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `AI warm-up failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.chat_history)) {
        throw new Error('Invalid AI warm-up response');
      }

      warmupResults.set(key, data);
      return data;
    })
    .catch((error) => {
      console.error('AI warm-up error:', error);

      // Allow a subsequent attempt after a failure.
      warmupRequests.delete(key);

      return null;
    });

  warmupRequests.set(key, request);

  return request;
};

export const getAIWarmupResult = (venue, username) => {
  return warmupResults.get(getCacheKey(venue, username)) || null;
};

// Retrieve an existing pending or completed warm-up.
export const getAIWarmup = (venue, username) => {
  return warmupRequests.get(getCacheKey(venue, username)) || null;
};

// Remove the cached request after use or when the session changes.
export const clearAIWarmup = (venue, username) => {
  const key = getCacheKey(venue, username);
  warmupRequests.delete(key);
  warmupResults.delete(key);
};
