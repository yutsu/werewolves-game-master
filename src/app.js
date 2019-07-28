const JapaneseNames = {
  'villager': '村人',
  'werewolf': '人狼'
}

class WerewolfGame extends React.Component {
  constructor(props) {
    super(props);
    this.handleDeleteOptions = this.handleDeleteOptions.bind(this);
    this.handlePick = this.handlePick.bind(this);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.handleDeleteOption = this.handleDeleteOption.bind(this);
    this.handleSelectRoles = this.handleSelectRoles.bind(this);
    this.updateNumberOfRoles = this.updateNumberOfRoles.bind(this);
    this.determineRoles = this.determineRoles.bind(this);
    this.nightActionRecord = this.nightActionRecord.bind(this);
    this.handleKilledAtNight = this.handleKilledAtNight.bind(this);
    this.handleWinningSide = this.handleWinningSide.bind(this);
    this.mostSuspiciousPlayer = this.mostSuspiciousPlayer.bind(this);
    this.morningPhase = this.morningPhase.bind(this);
    this.nightPhase = this.nightPhase.bind(this);
    this.nextPlayer = this.nextPlayer.bind(this);
    this.exile = this.exile.bind(this);
    this.restart = this.restart.bind(this);
    this.state = {
      players: [],
      players_selected: false,
      players_with_roles: [],
      role_determined: false,
      phase: 'night',
      possible_roles: ['villager', 'werewolf', 'seer', 'knight'],
      n_each_role: {'villager':0, 'werewolf':0, 'seer':0, 'knight':0},
      suspected_players: [],
      current_player_id: 0,
      night_action_to_be_killed: [],
      to_be_exiled: []
    };
  }
  componentDidMount() {
    try {
      const json = localStorage.getItem('players');
      const players = JSON.parse(json);

      if (players) {
        this.setState(() => ({ players }));
      }
    } catch (e) {
      // Do nothing at all
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.players.length !== this.state.players.length) {
      const json = JSON.stringify(this.state.players);
      localStorage.setItem('players', json);
    }
  }
  componentWillUnmount() {
    console.log('componentWillUnmount');
  }
  handleDeleteOptions() {
    this.setState(() => ({ players: [] }));
  }
  handleDeleteOption(optionToRemove) {
    this.setState((prevState) => ({
      players: prevState.players.filter((option) => optionToRemove !== option)
    }));
  }
  handlePick() {
    const randomNum = Math.floor(Math.random() * this.state.players.length);
    const option = this.state.players[randomNum];
    alert(option);
  }
  handleAddOption(option) {
    if (!option) {
      return 'Enter valid value to add item';
    } else if (this.state.players.indexOf(option) > -1) {
      return 'この名前はすでに使われています｡';
    }

    this.setState((prevState) => ({
      players: prevState.players.concat(option)
    }));
  }

  handleSelectRoles(){
    console.log('select roles');
    this.setState(() => ({ players_selected: true }));
  }

  updateNumberOfRoles(num, role){
    this.setState((prevState) => (prevState.n_each_role[role] = num + (num) * (num) *prevState.n_each_role[role]));
  }

  determineRoles(){
    if (this.numberOfPlayers() == this.numberOfSelectedRoles()){
      this.setState(() => ({ role_determined: true }));

      let roles = [];
      let n_each_role = this.state.n_each_role;
      let role;
      for (role in n_each_role) {
        while (n_each_role[role] > 0) {
          roles.push(role);
          n_each_role[role] --;
        }
      }

      // shuffle roles
      for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
      }

      for (let i=0; i < roles.length; i++) {
        if (roles[i] == 'villager') {
          let player = new Villager(this.state.players[i], true, 'villager', 0, true)
          this.setState((prevState) => ({
            players_with_roles: prevState.players_with_roles.concat(player)
          }));
        }
        if (roles[i] == 'werewolf') {
          let player = new Werewolf(this.state.players[i], true, 'werewolf', 1, true)
          this.setState((prevState) => ({
            players_with_roles: prevState.players_with_roles.concat(player)
          }));
        }
        if (roles[i] == 'seer') {
          let player = new Seer(this.state.players[i], true, 'seer', 0, true)
          this.setState((prevState) => ({
            players_with_roles: prevState.players_with_roles.concat(player)
          }));
        }
      }

    } else{
      console.log('n_roles != n_players')
    }
  }

  nightActionRecord(current_player_id, current_role, target_player, n_players) {
    if (current_role == 'villager') {
      this.setState((prevState) => ({
              suspected_players: prevState.suspected_players.concat(target_player.name)
            }));
    } else if (current_role == 'werewolf') {
      this.setState((prevState) => ({
              night_action_to_be_killed: prevState.night_action_to_be_killed.concat(target_player)
            }));

    } else {
      console.log('todo')
    }

    // if (current_player_id < n_players - 1){
    //  this.setState((prevState) => {
    //   current_player_id: prevState.current_player_id ++
    //  });
    // } else {
    //   this.setState((prevState) => {
    //   current_player_id: prevState.current_player_id = 0
    //  });
    //   this.setState((prevState) => {
    //   night_action_completed: prevState.night_action_completed = true
    //   })
    // }
    this.nextPlayer(current_player_id, current_role, target_player, n_players)
}

  nextPlayer(current_player_id, current_role, target_player, n_players) {
    if (current_player_id < n_players - 1){
     this.setState((prevState) => {
      current_player_id: prevState.current_player_id ++
     });
    } else {
      this.setState((prevState) => {
      current_player_id: prevState.current_player_id = 0
     });
      this.setState((prevState) => {
      phase: prevState.phase = 'night_action_completed'
      })
    }
  }

  handleKilledAtNight(){

    let killed_player = this.state.night_action_to_be_killed[0];
    killed_player.alive = false;
    return killed_player.name
  }

  mostSuspiciousPlayer(dead){
    let memo = {}
    let x;
    for (x of this.state.suspected_players) {
      if (x == dead){ continue;}
      if (memo[x]) {
        memo[x] ++;
      } else {
        memo[x] = 1;
      }
    }

    let max = 0
    let i;
    for (i of Object.values(memo)){
      if (i > max){
        max = i
      }
    }

    let result = []
    for (let key of Object.keys(memo)) {
      if (memo[key] == max) {
        result.push(key)
      }
    }

    return result
  }
  exile(player) {
    player.alive = false;
    this.exile2(player.name);
    this.morningActionCompletedPhase();
  }
  exile2(player) {
    this.setState((prevState) => ({to_be_exiled: [player] }));
  }

  morningActionCompletedPhase() {
    this.setState((prevState) => ({
    phase: (prevState.phase = 'morning_action_completed')
    }));
  }


  restart() {
    console.log('restart')
    this.setState(() => ({ players_with_roles: [] }));
    this.setState(() => ({ role_determined: false }));
    this.setState(() => ({ phase: 'night' }));
    this.setState(() => ({ suspected_players: [] }));
    this.setState(() => ({ current_player_id: 0 }));
    this.setState(() => ({ night_action_to_be_killed: [] }));
  }


  numberOfPlayers(){
    return(this.state.players.length)
  }

  numberOfSelectedRoles(){
    return(Object.values(this.state.n_each_role).reduce((a,b) => a+b, 0))
  }

  numberOfAliveVillagers() {
    let count = 0
    let x;
    for (x of this.state.players_with_roles) {
      if (x.side == 0 && x.alive) {
        count ++;
      }
    }
    return count
  }

  numberOfAliveWerewolves() {
    let count = 0
    let x;
    for (x of this.state.players_with_roles) {
      if (x.side == 1 && x.alive) {
        count ++;
      }
    }
    return count
  }

  handleWinningSide() {
    if (this.numberOfAliveVillagers() == this.numberOfAliveWerewolves()) {
      return 1
    } else if (this.numberOfAliveWerewolves() == 0) {
      return 0
    } else {
      return -1
    }
  }

  morningPhase() {
    this.setState((prevState) => {
    phase: prevState.phase = 'morning'
    })
  }

  nightPhase() {
    this.setState((prevState) => {
    phase: prevState.phase = 'night'
    })
  }

  render() {
    const subtitle = 'プレイヤーを登録してください';
    let register = (<div>
        <Header subtitle={subtitle} />
        <Action
          players_selected={this.state.players_selected}
          hasOptions={this.state.players.length > 0}
          handlePick={this.handlePick}
        />
        <Options
          players={this.state.players}
          handleDeleteOptions={this.handleDeleteOptions}
          handleDeleteOption={this.handleDeleteOption}
          players_selected={this.state.players_selected}
        />
        <AddOption
          handleAddOption={this.handleAddOption}
          players_selected={this.state.players_selected}
        />
        <SelectRoles
          hasOptions={this.state.players.length > 0}
          handleSelectRoles={this.handleSelectRoles}
        />
        {this.state.players_selected && <p>どの役割を使いますか?</p>}
        <RoleOptions
        players_selected={this.state.players_selected}
        updateNumberOfRoles={this.updateNumberOfRoles}
        determineRoles={this.determineRoles}
        />

      </div>)

    let night = (
      <div>
      <ShowRole
        current_player_id={this.state.current_player_id}
        players_with_roles={this.state.players_with_roles}
        nightActionRecord={this.nightActionRecord}
        nextPlayer={this.nextPlayer}
      />
      </div>
      )

    let night_result = (
      <div>
        <p>朝になりました｡</p>
        <ResultOfNight
          suspected_players={this.suspected_players}
          night_action_to_be_killed={this.night_action_to_be_killed}
          handleKilledAtNight={this.handleKilledAtNight}
          handleWinningSide={this.handleWinningSide}
          mostSuspiciousPlayer={this.mostSuspiciousPlayer}
          morningPhase={this.morningPhase}
          restart={this.restart}
        />
      </div>)

    let morning_exile = (
      <div>
        <p>追放する人を決めてください｡</p>
        <ListToBeExiled
          players_with_roles={this.state.players_with_roles}
          exile={this.exile}
        />
      </div>)

    let morning_result = (
      <div>
        <ResultOfMorning
          handleWinningSide={this.handleWinningSide}
          to_be_exiled={this.state.to_be_exiled}
          nightPhase={this.nightPhase}
          restart={this.restart}
        />
      </div>)

    if (!this.state.role_determined){
      return (
        register
      );
    } else if (this.state.phase == 'night'){
      return (
        night
        );
    } else if (this.state.phase == 'night_action_completed'){
      return (
        night_result
        );
    } else if (this.state.phase == 'morning'){
      return (
        morning_exile
        );
    } else if (this.state.phase == 'morning_action_completed'){
      return (
        morning_result
        );
    } else {
      <div>else</div>
    }

  }
}

const Header = (props) => {
  return (
    <div>
      <h1>{props.title}</h1>
      {props.subtitle && <h2>{props.subtitle}</h2>}
    </div>
  );
};

Header.defaultProps = {
  title: '人狼ゲーム'
};

const Action = (props) => {
  if (props.players_selected){
    return(<div></div>)
  }
  return (
    <div>
      <button
        onClick={props.handlePick}
        disabled={!props.hasOptions}
      >
        What should I do?
      </button>
    </div>
  );
};

const Options = (props) => {
  if (props.players_selected){
    return(<div></div>)
  }
  return (
    <div>
      <button onClick={props.handleDeleteOptions}>Remove All</button>
      {props.players.length === 0 && <p>名前を入力してください｡</p>}
      {
        props.players.map((option) => (
          <Option
            key={option}
            optionText={option}
            handleDeleteOption={props.handleDeleteOption}
          />
        ))
      }
    </div>
  );
};

const Option = (props) => {
  return (
    <div>
      {props.optionText}
      <button
        onClick={(e) => {
          props.handleDeleteOption(props.optionText);
        }}
      >
        削除
      </button>
    </div>
  );
};

class AddOption extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddOption = this.handleAddOption.bind(this);
    this.state = {
      error: undefined
    };
  }
  handleAddOption(e) {
    e.preventDefault();

    const option = e.target.elements.option.value.trim();
    const error = this.props.handleAddOption(option);

    this.setState(() => ({ error }));

    if (!error) {
      e.target.elements.option.value = '';
    }
  }
  render() {
    if (this.props.players_selected){
      return(<div></div>)
    }
    return (
      <div>
        {this.state.error && <p>{this.state.error}</p>}
        <form onSubmit={this.handleAddOption}>
          <input type="text" name="option" />
          <button>追加する</button>
        </form>
      </div>
    );
  }
}


const SelectRoles = (props) => {
  return (
    <div>
      <button
        disabled={!props.hasOptions}
        onClick={props.handleSelectRoles}
      >
        役割の選択へ
      </button>
    </div>
  );
};


const RoleOptions = (props) => {
  if (props.players_selected){
    return(<div></div>)
  }
  return (
    <div>
      <Counter
      role='villager'
      updateNumberOfRoles={props.updateNumberOfRoles}
      />

      <Counter
      role='werewolf'
      updateNumberOfRoles={props.updateNumberOfRoles}
      />
      <button onClick={props.determineRoles}>決定</button>
    </div>
  );
};


const ShowRole = (props) => {
  let player = props.players_with_roles[props.current_player_id]
  let name = player.name
  if (player.alive){
    return(
      <div>
        <p>{name}さんの番です｡ 本当に{name}さんですか?</p>
        <p>{name}さんは{JapaneseNames[player.role]}です｡</p>
        <p>{player.action_sentence}</p>
        <ShowListOfPlayers
          current_player={player}
          current_player_id={props.current_player_id}
          players_with_roles={props.players_with_roles}
          nightActionRecord={props.nightActionRecord}
        />
      </div>
      );
  } else {
    return (
      <div>
        <p>{name}さんは死んでいます｡</p>
        <button
        onClick={(e) => {
          props.nextPlayer(props.current_player_id, player.role, player, Object.keys(props.players_with_roles).length)}
          }
        >
        次のプレーヤーへ
      </button>
      </div>)
  }

};

const ShowListOfPlayers = (props) => {
  return(
    <div>
      {props.players_with_roles.map((player) => {
        if (player !== props.current_player && player.alive){
          return (
            <button
              key={player.name}
              onClick={(e) => {
                props.nightActionRecord(props.current_player_id, props.current_player.role, player, Object.keys(props.players_with_roles).length)}
              }
            >
              {player.name}さんを選ぶ｡
            </button>
            )
        }
      })}
    </div>
    )
}


const ResultOfNight = (props) => {
  let x = props.handleKilledAtNight();
  let y = props.handleWinningSide();
  let suspected_players = props.mostSuspiciousPlayer(x);
  if (y == -1) {
    return(
      <div>
        <p>昨日の犠牲者は{x}さんです｡</p>
        <p>今もっとも疑われているのは</p>
        {suspected_players.map((player) => {
          return <p key={player}>{player}さん</p>;
        })}
        <button
          onClick={props.morningPhase}
        >
          次へ
        </button>
      </div>
      )
  } else if (y == 1) {
    return(
      <div>
        <p>昨日の犠牲者は{x}さんです｡</p>
        <h1>人狼の勝利!</h1>
        <button
        onClick={props.restart}
        >
        もう1ゲームする
        </button>
      </div>
      )
  } else if (y == 0) {
    return(
      <div>
        <p>昨日の犠牲者は{x}さんです｡</p>
        <h1>村人の勝利!</h1>
        <button
        onClick={props.restart}
        >
        もう1ゲームする
        </button>
      </div>
      )
  }

}

const ResultOfMorning = (props) => {
  let x = props.to_be_exiled[0];
  let y = props.handleWinningSide();
  if (y == -1) {
    return(
      <div>
        <p>{x}さん, 最後に遺言をどうぞ｡</p>
        <button
          onClick={props.nightPhase}
        >
          次へ
        </button>
      </div>
      )
  } else if (y == 1) {
    return(
      <div>
        <p>{x}さん, 最後に遺言をどうぞ｡</p>
        <h1>人狼の勝利!</h1>
        <button
        onClick={props.restart}
        >
        もう1ゲームする
        </button>
      </div>
      )
  } else if (y == 0) {
    return(
      <div>
        <p>{x}さん, 最後に遺言をどうぞ｡</p>
        <h1>村人の勝利!</h1>
        <button
        onClick={props.restart}
        >
        もう1ゲームする
        </button>
      </div>
      )
  }
}

const ListToBeExiled = (props) => {
  return(
    <div>
      {props.players_with_roles.map((player) => {
        if (player.alive){
          return (
            <button
              key={player.name}
              onClick={(e) => {
                props.exile(player)
                }
              }
            >
              {player.name}さんを追放
            </button>
            )
          }
      })}
    </div>
    )
}


class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddOne = this.handleAddOne.bind(this);
    this.handleMinusOne = this.handleMinusOne.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.state = {
      count: 0
    };
  }
  // componentDidMount() {
  //   const stringCount = localStorage.getItem('counter');
  //   const count = parseInt(stringCount, 10);

  //   if (!isNaN(count)) {
  //     this.setState(() => ({ count }));
  //   }
  // }
  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.count !== this.state.count) {
  //     localStorage.setItem('counter', this.state.count);
  //   }
  // }
  handleAddOne() {
    this.props.updateNumberOfRoles(1, this.props.role)
    this.setState((prevState) => {
      return {
        count: prevState.count + 1
      };
    });
  }
  handleMinusOne() {
    this.setState((prevState) => {
      if (prevState.count === 0){
        return
      }
      this.props.updateNumberOfRoles(-1, this.props.role)
      return {
        count: prevState.count - 1
      };
    });
  }
  handleReset() {
    this.props.updateNumberOfRoles(0, this.props.role)
    this.setState(() => {
      return {
        count: 0
      };
    });
  }
  render() {
    return (
      <div>

        <p>{JapaneseNames[this.props.role]}:{this.state.count}</p>
        <button onClick={this.handleAddOne}>+1</button>
        <button onClick={this.handleMinusOne}>-1</button>
        <button onClick={this.handleReset}>reset</button>
      </div>
    );
  }
}

class Player {
  constructor(name, alive){
    this.name = name;
    this.alive = true
  }
}

class Villager extends Player{
  constructor(name, alive, role, side, killable){
    super(name, alive);
    this.role = 'villager';
    this.side = 0;
    this.killable = true;
    this.action_sentence = 'もっとも疑わしい人を一人選んでください｡';
  }
}

class Werewolf extends Player{
  constructor(name, alive, role, side, killable){
    super(name, alive);
    this.role = 'werewolf';
    this.side = 1;
    this.killable = true;
    this.action_sentence = '今晩襲う人を決めてください｡';
  }
}

class Seer extends Villager{
  constructor(name, alive, role, side, killable){
    super(name, alive, side);
    this.role = 'seer';
    this.killable = true
  }
}


ReactDOM.render(<WerewolfGame />, document.getElementById('app'));
