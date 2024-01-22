// Importing the FBPlayer model
import FBPlayer from '../models/FBPlayer.js';

// Example of using the model in a controller function
export const home = async (req, res) => {
  try {
    const players = await FBPlayer.find();
    res.render('index', { players });
  } catch (error) {
    // Error handling
  }
};

export const offense = async (req, res) => {
  try {
    const players = await FBPlayer.find({
      $or: [
        { receptions: { $gt: 0 } },
        { recYds: { $gt: 0 } },
        { rushes: { $gt: 0 } },
        { rushYds: { $gt: 0 } },
        { passAttempts: { $gt: 0 } },
        { passCompletions: { $gt: 0 } },
        { passYds: { $gt: 0 } },
        { rushTDs: { $gt: 0 } },
        { recTDs: { $gt: 0 } },
        { passTDs: { $gt: 0 } },
        { intsThrown: { $gt: 0 } }
      ]
    });

    res.render('offense', { players });
  } catch (error) {
    // Error handling
  }
};

export const defense = async (req, res) => {
  try {
    const players = await FBPlayer.find({
      $or: [
        { intsMade: { $gt: 0 } },
        { sacks: { $gt: 0 } },
        { tackles: { $gt: 0 } },
        { passDefenses: { $gt: 0 } },
        { defTDs: { $gt: 0 } }
      ]
    });

    res.render('defense', { players });
  } catch (error) {
    // Error handling
  }
};

export const loadGameLog = async (req, res) => {
  const players = await FBPlayer.find();
  res.render('gameLog', { players });
}

export const submitPlay = async (req, res) => {
  console.log(req.body);
  let player, playerName1, playerName2, summary = "", playerName
  let receptions = 0, recYds = 0, rushes = 0, rushYds = 0, passAttempts = 0, passCompletions = 0, passYds = 0, rushTDs = 0, recTDs = 0, passTDs = 0, intsThrown = 0, intsMade = 0, sacks = 0, tackles = 0, passDefenses = 0, defTDs = 0;
  
  if (req.body.playType === 'offense') {
    if (req.body.offensePlay === 'run') {
      playerName1 = req.body.runner; 
      rushYds = parseInt(req.body.runYards, 10);
      rushes = 1;
      rushTDs = req.body.touchdown === 'on' ? 1 : 0;
      
      summary += `Run by ${playerName1} for ${rushYds} yards`;
      req.body.touchdown === 'on' ? summary += ' resulting in a touchdown.' : summary += '.';
      
      
    }
    else if (req.body.offensePlay === 'pass') {
      playerName1 = req.body.passer; 
      playerName2 = req.body.receiver; 
      passYds = recYds = parseInt(req.body.passYards, 10);
      receptions = 1;
      passAttempts = 1;
      passCompletions = 1;
      passTDs = recTDs = req.body.touchdown === 'on' ? 1 : 0;
      
      summary += `Pass by ${playerName1} to ${playerName2} for ${passYds} yards`;
      req.body.touchdown === 'on' ? summary += ' resulting in a touchdown!' : summary += '.';
    }
  } else {
    playerName1 = req.body.defender; 
    let defAction = req.body.defensiveAction; 
    defAction === 'interception' ? intsMade = 1 : 0;
    defAction === 'sack' ? sacks = 1 : 0;
    defAction === 'tackle' ? tackles = 1 : 0;
    defAction === 'passDefense' ? passDefenses = 1 : 0;
    defTDs = req.body.touchdown === 'on' ? 1 : 0;

    summary += `${playerName1} with the ${defAction === 'passDefense' ? 'pass defense' : defAction}`;
    req.body.touchdown === 'on' ? summary += ' resulting in a touchdown!' : summary += '.';
  }

  try {
    // Find the player by name
    player = await FBPlayer.findOne({ playerName : playerName1 });

    if (player) {
      // Update player stats
      player.rushes = (player.rushes || 0) + rushes;
      player.rushYds = (player.rushYds || 0) + rushYds;
      player.rushTDs = (player.rushTDs || 0) + rushTDs;
      
      player.passAttempts = (player.passAttempts || 0) + passAttempts;
      player.passCompletions = (player.passCompletions || 0) + passCompletions;
      player.passYds = (player.passYds || 0) + passYds;
      player.passTDs = (player.passTDs || 0) + passTDs;
      
      player.intsMade = (player.intsMade || 0) + intsMade;
      player.sacks = (player.sacks || 0) + sacks;
      player.tackles = (player.tackles || 0) + tackles;
      player.passDefenses = (player.passDefenses || 0) + passDefenses;
      player.defTDs = (player.defTDs || 0) + defTDs;

      // Save the updated player
      await player.save();
    }
    else console.log(`Can't find player1`);
    
    if (playerName2) {
      player = await FBPlayer.findOne({ playerName : playerName2 });

      if (player) {
        // Update player stats
        player.receptions = (player.receptions || 0) + receptions;
        player.recYds = (player.recYds || 0) + recYds;
        player.recTDs = (player.recTDs || 0) + recTDs;

        // Save the updated player
        await player.save();
      }
      else console.log(`Can't find player2`);
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
    // Handle error (e.g., send a response indicating failure)
  }

  // Add flash message
  req.flash('info', summary);
  
  // Redirect to game log or appropriate route
  res.redirect('/game-log');
};

export const deleteAll = async (req, res) => {
  try {
    const result = await FBPlayer.deleteMany({});
    console.log(`${result.deletedCount} records deleted.`);
    res.redirect('/');
  } catch (error) {
    console.error('Error deleting records:', err);
  }
};
