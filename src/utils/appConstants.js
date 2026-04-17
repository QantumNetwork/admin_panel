export const getAppType = (appType) => {
  const appTypeMap = {
    'MaxGaming': 'Max Gaming',
    'Manly': 'Manly Harbour Boat Club',
    'Montauk': 'Montauk Tavern',
    'StarReward': 'Star Reward',
    'Central': 'Central Lane Hotel',
    'Sense': 'Sense Of Taste',
    'North': 'North Shore Tavern',
    'Hogan': "Hogan's",
    'Ace': 'Ace Rewards',
    'Queens': 'Queens Hotel',
    'Brisbane': 'Brisbane Brewing Co',
    'Bluewater': 'Bluewater Captains Club',
    'Flinders': 'Flinders Street Wharves',
    'Drinks': 'Drinks HQ',
    'Wonthaggi': 'Wonthaggi Country Club',
    'Woollahra': 'Woollahra Hotel',
    'Bob': "Bob's Bulk Booze",
  };
  
  return appTypeMap[appType] || appType;
};

export const getIconVenue = (appType) => {
    const appIconMap = {
    'Qantum': '/qantum.png',
    'MaxGaming': '/max_gaming.png',
    'Manly': '/mhbc.png',
    'Montauk': '/montauk.png',
    'StarReward': '/star.png',
    'Central': '/central.png',
    'Sense': '/sense.png',
    'North': '/north.png',
    'Hogan': "/hogan.png",
    'Ace': '/ace.png',
    'Queens': '/queens.png',
    'Brisbane': '/brisbane.png',
    'Bluewater': '/bluewater.png',
    'Flinders': '/flinders.png',
    'Drinks': '/drinks.png',
    'Wonthaggi': '/wonthaggi.png',
    'Woollahra': '/woollahra.png',
    'EDP': '/edp.png',
    'Bob': '/bob.png',
  };
  
  return appIconMap[appType] || appType;
}

export const getAudienceOptions = (venueName) => {
  const audienceMap = {
    'Qantum': [
      { value: 'Staff', label: 'Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ],
    'MaxGaming': [
      // Same as Qantum
      { value: 'Staff', label: 'Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
    ],
    'StarReward': [
      { value: 'Staff Pre 3Mth', label: 'Staff Pre 3Mth' },
      { value: 'Star Staff', label: 'Star Staff' },
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
      { value: 'Platinum Black', label: 'Platinum Black' },
    ],
    'Manly': [
      { value: 'Staff', label: 'Staff' },
      { value: 'Crewmate', label: 'Crewmate' },
      { value: 'Lieutenant', label: 'Lieutenant' },
      { value: 'Commander', label: 'Commander' },
      { value: 'Captain', label: 'Captain' },
      { value: 'Commodore', label: 'Commodore' },
    ],
    'Hogan': [
      { value: 'Bronze', label: 'Bronze' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
      { value: 'Staff', label: 'Staff' },
      { value: 'Management', label: 'Management' },
      { value: 'Family', label: 'Family' },
      { value: 'Directors', label: 'Directors' },
    ],
    'North': [
      { value: 'Gold', label: 'Gold' },
      { value: 'Platinum', label: 'Platinum' },
      // { value: 'Pre Staff', label: 'Pre Staff' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Staff', label: 'Staff' },
      // { value: 'Valued', label: 'Valued' },
    ],
    'Montauk': [
      { value: 'Premium Member', label: 'Premium Member' },
      { value: 'Member', label: 'Member' },
      { value: 'Staff', label: 'Staff' },
    ],
    //same as Montauk
    'Central': [
      { value: 'Premium Member', label: 'Premium Member' },
      { value: 'Member', label: 'Member' },
      { value: 'Staff', label: 'Staff' },
    ],
    'Ace': [
      { value: 'Staff', label: 'Staff' },
      { value: 'Tens', label: 'Tens' },
      { value: 'Jacks', label: 'Jacks' },
      { value: 'Queens', label: 'Queens' },
      { value: 'Kings', label: 'Kings' },
      { value: 'Ace', label: 'Ace' },
      { value: 'Ace Plus', label: 'Ace Plus' },
    ],
    'Queens': [
      { value: 'Queens', label: 'Queens' },
      { value: 'Ruby', label: 'Ruby' },
      { value: 'Emerald', label: 'Emerald' },
      { value: 'Sapphire', label: 'Sapphire' },
      { value: 'Diamond', label: 'Diamond' },
      { value: 'Diamond Plus', label: 'Diamond Plus' },
      { value: 'Curtis Coast', label: 'Curtis Coast' },
    ],
    'Brisbane': [
      { value: 'Brew Crew', label: 'Brew Crew' },
      { value: 'Member', label: 'Member' },
      { value: 'Regular', label: 'Regular' },
      { value: 'Champion', label: 'Champion' },
      { value: 'Legend', label: 'Legend' },
    ],
    'Bluewater': [
      { value: 'Deckhand', label: 'Deckhand' },
      { value: 'First Mate', label: 'First Mate' },
      { value: 'Captain', label: 'Captain' },
      { value: 'Commodore', label: 'Commodore' },
      { value: 'Admiral', label: 'Admiral' },
    ],
    'Flinders': [
      { value: 'Staff', label: 'Staff' },
      { value: 'Member', label: 'Member' },
      { value: 'Corporate', label: 'Corporate' },
      { value: 'VIP', label: 'VIP' },    
    ],
    'Drinks': [
      { value: 'Staff', label: 'Staff' },
      { value: 'Explorer', label: 'Explorer' },
      { value: 'Masters', label: 'Masters' },
      { value: 'Club', label: 'Club' },
      { value: 'Reserve', label: 'Reserve' },
    ],
    'Wonthaggi': [
      { value: 'Valued', label: 'Valued' },
      { value: 'Silver', label: 'Silver' },
      { value: 'Platinum', label: 'Platinum' },
      { value: 'Gold', label: 'Gold' },
    ],
    'Woollahra': [
      {
        value: 'Crew',
        label: 'Crew',
      },
      {
        value: 'Regulars',
        label: 'Regulars',
      },
      {
        value: 'Club Connect',
        label: 'Club Connect',
      },
      {
        value: 'Local Legends',
        label: 'Local Legends',
      },
    ],
    'EDP': [
        {value: 'Staff', label: 'Staff'},
        {value: 'Silver', label: 'Silver'},
        {value: 'Gold', label: 'Gold'},
        {value: 'Diamond', label: 'Diamond'}
    ],
    'Bob': [
      {value: 'Valued', label: 'Membership Benefits'},
    ]
  };

  // Return venue-specific options or default
  return audienceMap[venueName] || [
    { value: 'Staff', label: 'Staff' },
    { value: 'Valued', label: 'Valued' },
    { value: 'Silver', label: 'Silver' },
    { value: 'Gold', label: 'Gold' },
    { value: 'Platinum', label: 'Platinum' },
  ];
};