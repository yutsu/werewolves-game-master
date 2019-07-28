'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var JapaneseNames = {
  'villager': '村人',
  'werewolf': '人狼'
};

var WerewolfGame = function (_React$Component) {
  _inherits(WerewolfGame, _React$Component);

  function WerewolfGame(props) {
    _classCallCheck(this, WerewolfGame);

    var _this = _possibleConstructorReturn(this, (WerewolfGame.__proto__ || Object.getPrototypeOf(WerewolfGame)).call(this, props));

    _this.handleDeleteOptions = _this.handleDeleteOptions.bind(_this);
    _this.handlePick = _this.handlePick.bind(_this);
    _this.handleAddOption = _this.handleAddOption.bind(_this);
    _this.handleDeleteOption = _this.handleDeleteOption.bind(_this);
    _this.handleSelectRoles = _this.handleSelectRoles.bind(_this);
    _this.updateNumberOfRoles = _this.updateNumberOfRoles.bind(_this);
    _this.determineRoles = _this.determineRoles.bind(_this);
    _this.nightActionRecord = _this.nightActionRecord.bind(_this);
    _this.handleKilledAtNight = _this.handleKilledAtNight.bind(_this);
    _this.handleWinningSide = _this.handleWinningSide.bind(_this);
    _this.mostSuspiciousPlayer = _this.mostSuspiciousPlayer.bind(_this);
    _this.morningPhase = _this.morningPhase.bind(_this);
    _this.nightPhase = _this.nightPhase.bind(_this);
    _this.nextPlayer = _this.nextPlayer.bind(_this);
    _this.exile = _this.exile.bind(_this);
    _this.restart = _this.restart.bind(_this);
    _this.state = {
      players: [],
      players_selected: false,
      players_with_roles: [],
      role_determined: false,
      phase: 'night',
      possible_roles: ['villager', 'werewolf', 'seer', 'knight'],
      n_each_role: { 'villager': 0, 'werewolf': 0, 'seer': 0, 'knight': 0 },
      suspected_players: [],
      current_player_id: 0,
      night_action_to_be_killed: [],
      to_be_exiled: []
    };
    return _this;
  }

  _createClass(WerewolfGame, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      try {
        var json = localStorage.getItem('players');
        var players = JSON.parse(json);

        if (players) {
          this.setState(function () {
            return { players: players };
          });
        }
      } catch (e) {
        // Do nothing at all
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevState.players.length !== this.state.players.length) {
        var json = JSON.stringify(this.state.players);
        localStorage.setItem('players', json);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      console.log('componentWillUnmount');
    }
  }, {
    key: 'handleDeleteOptions',
    value: function handleDeleteOptions() {
      this.setState(function () {
        return { players: [] };
      });
    }
  }, {
    key: 'handleDeleteOption',
    value: function handleDeleteOption(optionToRemove) {
      this.setState(function (prevState) {
        return {
          players: prevState.players.filter(function (option) {
            return optionToRemove !== option;
          })
        };
      });
    }
  }, {
    key: 'handlePick',
    value: function handlePick() {
      var randomNum = Math.floor(Math.random() * this.state.players.length);
      var option = this.state.players[randomNum];
      alert(option);
    }
  }, {
    key: 'handleAddOption',
    value: function handleAddOption(option) {
      if (!option) {
        return 'Enter valid value to add item';
      } else if (this.state.players.indexOf(option) > -1) {
        return 'この名前はすでに使われています｡';
      }

      this.setState(function (prevState) {
        return {
          players: prevState.players.concat(option)
        };
      });
    }
  }, {
    key: 'handleSelectRoles',
    value: function handleSelectRoles() {
      console.log('select roles');
      this.setState(function () {
        return { players_selected: true };
      });
    }
  }, {
    key: 'updateNumberOfRoles',
    value: function updateNumberOfRoles(num, role) {
      this.setState(function (prevState) {
        return prevState.n_each_role[role] = num + num * num * prevState.n_each_role[role];
      });
    }
  }, {
    key: 'determineRoles',
    value: function determineRoles() {
      var _this2 = this;

      if (this.numberOfPlayers() == this.numberOfSelectedRoles()) {
        this.setState(function () {
          return { role_determined: true };
        });

        var roles = [];
        var n_each_role = this.state.n_each_role;
        var role = void 0;
        for (role in n_each_role) {
          while (n_each_role[role] > 0) {
            roles.push(role);
            n_each_role[role]--;
          }
        }

        // shuffle roles
        for (var i = roles.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var _ref = [roles[j], roles[i]];
          roles[i] = _ref[0];
          roles[j] = _ref[1];
        }

        for (var _i = 0; _i < roles.length; _i++) {
          if (roles[_i] == 'villager') {
            (function () {
              var player = new Villager(_this2.state.players[_i], true, 'villager', 0, true);
              _this2.setState(function (prevState) {
                return {
                  players_with_roles: prevState.players_with_roles.concat(player)
                };
              });
            })();
          }
          if (roles[_i] == 'werewolf') {
            (function () {
              var player = new Werewolf(_this2.state.players[_i], true, 'werewolf', 1, true);
              _this2.setState(function (prevState) {
                return {
                  players_with_roles: prevState.players_with_roles.concat(player)
                };
              });
            })();
          }
          if (roles[_i] == 'seer') {
            (function () {
              var player = new Seer(_this2.state.players[_i], true, 'seer', 0, true);
              _this2.setState(function (prevState) {
                return {
                  players_with_roles: prevState.players_with_roles.concat(player)
                };
              });
            })();
          }
        }
      } else {
        console.log('n_roles != n_players');
      }
    }
  }, {
    key: 'nightActionRecord',
    value: function nightActionRecord(current_player_id, current_role, target_player, n_players) {
      if (current_role == 'villager') {
        this.setState(function (prevState) {
          return {
            suspected_players: prevState.suspected_players.concat(target_player.name)
          };
        });
      } else if (current_role == 'werewolf') {
        this.setState(function (prevState) {
          return {
            night_action_to_be_killed: prevState.night_action_to_be_killed.concat(target_player)
          };
        });
      } else {
        console.log('todo');
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
      this.nextPlayer(current_player_id, current_role, target_player, n_players);
    }
  }, {
    key: 'nextPlayer',
    value: function nextPlayer(current_player_id, current_role, target_player, n_players) {
      if (current_player_id < n_players - 1) {
        this.setState(function (prevState) {
          current_player_id: prevState.current_player_id++;
        });
      } else {
        this.setState(function (prevState) {
          current_player_id: prevState.current_player_id = 0;
        });
        this.setState(function (prevState) {
          phase: prevState.phase = 'night_action_completed';
        });
      }
    }
  }, {
    key: 'handleKilledAtNight',
    value: function handleKilledAtNight() {

      var killed_player = this.state.night_action_to_be_killed[0];
      killed_player.alive = false;
      return killed_player.name;
    }
  }, {
    key: 'mostSuspiciousPlayer',
    value: function mostSuspiciousPlayer(dead) {
      var memo = {};
      var x = void 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.state.suspected_players[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          x = _step.value;

          if (x == dead) {
            continue;
          }
          if (memo[x]) {
            memo[x]++;
          } else {
            memo[x] = 1;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var max = 0;
      var i = void 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Object.values(memo)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          i = _step2.value;

          if (i > max) {
            max = i;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var result = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.keys(memo)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var key = _step3.value;

          if (memo[key] == max) {
            result.push(key);
          }
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return result;
    }
  }, {
    key: 'exile',
    value: function exile(player) {
      player.alive = false;
      this.exile2(player.name);
      this.morningActionCompletedPhase();
    }
  }, {
    key: 'exile2',
    value: function exile2(player) {
      this.setState(function (prevState) {
        return { to_be_exiled: [player] };
      });
    }
  }, {
    key: 'morningActionCompletedPhase',
    value: function morningActionCompletedPhase() {
      this.setState(function (prevState) {
        return {
          phase: prevState.phase = 'morning_action_completed'
        };
      });
    }
  }, {
    key: 'restart',
    value: function restart() {
      console.log('restart');
      this.setState(function () {
        return { players_with_roles: [] };
      });
      this.setState(function () {
        return { role_determined: false };
      });
      this.setState(function () {
        return { phase: 'night' };
      });
      this.setState(function () {
        return { suspected_players: [] };
      });
      this.setState(function () {
        return { current_player_id: 0 };
      });
      this.setState(function () {
        return { night_action_to_be_killed: [] };
      });
    }
  }, {
    key: 'numberOfPlayers',
    value: function numberOfPlayers() {
      return this.state.players.length;
    }
  }, {
    key: 'numberOfSelectedRoles',
    value: function numberOfSelectedRoles() {
      return Object.values(this.state.n_each_role).reduce(function (a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: 'numberOfAliveVillagers',
    value: function numberOfAliveVillagers() {
      var count = 0;
      var x = void 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.state.players_with_roles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          x = _step4.value;

          if (x.side == 0 && x.alive) {
            count++;
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return count;
    }
  }, {
    key: 'numberOfAliveWerewolves',
    value: function numberOfAliveWerewolves() {
      var count = 0;
      var x = void 0;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.state.players_with_roles[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          x = _step5.value;

          if (x.side == 1 && x.alive) {
            count++;
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      return count;
    }
  }, {
    key: 'handleWinningSide',
    value: function handleWinningSide() {
      if (this.numberOfAliveVillagers() == this.numberOfAliveWerewolves()) {
        return 1;
      } else if (this.numberOfAliveWerewolves() == 0) {
        return 0;
      } else {
        return -1;
      }
    }
  }, {
    key: 'morningPhase',
    value: function morningPhase() {
      this.setState(function (prevState) {
        phase: prevState.phase = 'morning';
      });
    }
  }, {
    key: 'nightPhase',
    value: function nightPhase() {
      this.setState(function (prevState) {
        phase: prevState.phase = 'night';
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var subtitle = 'プレイヤーを登録してください';
      var register = React.createElement(
        'div',
        null,
        React.createElement(Header, { subtitle: subtitle }),
        React.createElement(Action, {
          players_selected: this.state.players_selected,
          hasOptions: this.state.players.length > 0,
          handlePick: this.handlePick
        }),
        React.createElement(Options, {
          players: this.state.players,
          handleDeleteOptions: this.handleDeleteOptions,
          handleDeleteOption: this.handleDeleteOption,
          players_selected: this.state.players_selected
        }),
        React.createElement(AddOption, {
          handleAddOption: this.handleAddOption,
          players_selected: this.state.players_selected
        }),
        React.createElement(SelectRoles, {
          hasOptions: this.state.players.length > 0,
          handleSelectRoles: this.handleSelectRoles
        }),
        this.state.players_selected && React.createElement(
          'p',
          null,
          '\u3069\u306E\u5F79\u5272\u3092\u4F7F\u3044\u307E\u3059\u304B?'
        ),
        React.createElement(RoleOptions, {
          players_selected: this.state.players_selected,
          updateNumberOfRoles: this.updateNumberOfRoles,
          determineRoles: this.determineRoles
        })
      );

      var night = React.createElement(
        'div',
        null,
        React.createElement(ShowRole, {
          current_player_id: this.state.current_player_id,
          players_with_roles: this.state.players_with_roles,
          nightActionRecord: this.nightActionRecord,
          nextPlayer: this.nextPlayer
        })
      );

      var night_result = React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          '\u671D\u306B\u306A\u308A\u307E\u3057\u305F\uFF61'
        ),
        React.createElement(ResultOfNight, {
          suspected_players: this.suspected_players,
          night_action_to_be_killed: this.night_action_to_be_killed,
          handleKilledAtNight: this.handleKilledAtNight,
          handleWinningSide: this.handleWinningSide,
          mostSuspiciousPlayer: this.mostSuspiciousPlayer,
          morningPhase: this.morningPhase,
          restart: this.restart
        })
      );

      var morning_exile = React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          '\u8FFD\u653E\u3059\u308B\u4EBA\u3092\u6C7A\u3081\u3066\u304F\u3060\u3055\u3044\uFF61'
        ),
        React.createElement(ListToBeExiled, {
          players_with_roles: this.state.players_with_roles,
          exile: this.exile
        })
      );

      var morning_result = React.createElement(
        'div',
        null,
        React.createElement(ResultOfMorning, {
          handleWinningSide: this.handleWinningSide,
          to_be_exiled: this.state.to_be_exiled,
          nightPhase: this.nightPhase,
          restart: this.restart
        })
      );

      if (!this.state.role_determined) {
        return register;
      } else if (this.state.phase == 'night') {
        return night;
      } else if (this.state.phase == 'night_action_completed') {
        return night_result;
      } else if (this.state.phase == 'morning') {
        return morning_exile;
      } else if (this.state.phase == 'morning_action_completed') {
        return morning_result;
      } else {
        React.createElement(
          'div',
          null,
          'else'
        );
      }
    }
  }]);

  return WerewolfGame;
}(React.Component);

var Header = function Header(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'h1',
      null,
      props.title
    ),
    props.subtitle && React.createElement(
      'h2',
      null,
      props.subtitle
    )
  );
};

Header.defaultProps = {
  title: '人狼ゲーム'
};

var Action = function Action(props) {
  if (props.players_selected) {
    return React.createElement('div', null);
  }
  return React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      {
        onClick: props.handlePick,
        disabled: !props.hasOptions
      },
      'What should I do?'
    )
  );
};

var Options = function Options(props) {
  if (props.players_selected) {
    return React.createElement('div', null);
  }
  return React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      { onClick: props.handleDeleteOptions },
      'Remove All'
    ),
    props.players.length === 0 && React.createElement(
      'p',
      null,
      '\u540D\u524D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044\uFF61'
    ),
    props.players.map(function (option) {
      return React.createElement(Option, {
        key: option,
        optionText: option,
        handleDeleteOption: props.handleDeleteOption
      });
    })
  );
};

var Option = function Option(props) {
  return React.createElement(
    'div',
    null,
    props.optionText,
    React.createElement(
      'button',
      {
        onClick: function onClick(e) {
          props.handleDeleteOption(props.optionText);
        }
      },
      '\u524A\u9664'
    )
  );
};

var AddOption = function (_React$Component2) {
  _inherits(AddOption, _React$Component2);

  function AddOption(props) {
    _classCallCheck(this, AddOption);

    var _this3 = _possibleConstructorReturn(this, (AddOption.__proto__ || Object.getPrototypeOf(AddOption)).call(this, props));

    _this3.handleAddOption = _this3.handleAddOption.bind(_this3);
    _this3.state = {
      error: undefined
    };
    return _this3;
  }

  _createClass(AddOption, [{
    key: 'handleAddOption',
    value: function handleAddOption(e) {
      e.preventDefault();

      var option = e.target.elements.option.value.trim();
      var error = this.props.handleAddOption(option);

      this.setState(function () {
        return { error: error };
      });

      if (!error) {
        e.target.elements.option.value = '';
      }
    }
  }, {
    key: 'render',
    value: function render() {
      if (this.props.players_selected) {
        return React.createElement('div', null);
      }
      return React.createElement(
        'div',
        null,
        this.state.error && React.createElement(
          'p',
          null,
          this.state.error
        ),
        React.createElement(
          'form',
          { onSubmit: this.handleAddOption },
          React.createElement('input', { type: 'text', name: 'option' }),
          React.createElement(
            'button',
            null,
            '\u8FFD\u52A0\u3059\u308B'
          )
        )
      );
    }
  }]);

  return AddOption;
}(React.Component);

var SelectRoles = function SelectRoles(props) {
  return React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      {
        disabled: !props.hasOptions,
        onClick: props.handleSelectRoles
      },
      '\u5F79\u5272\u306E\u9078\u629E\u3078'
    )
  );
};

var RoleOptions = function RoleOptions(props) {
  if (props.players_selected) {
    return React.createElement('div', null);
  }
  return React.createElement(
    'div',
    null,
    React.createElement(Counter, {
      role: 'villager',
      updateNumberOfRoles: props.updateNumberOfRoles
    }),
    React.createElement(Counter, {
      role: 'werewolf',
      updateNumberOfRoles: props.updateNumberOfRoles
    }),
    React.createElement(
      'button',
      { onClick: props.determineRoles },
      '\u6C7A\u5B9A'
    )
  );
};

var ShowRole = function ShowRole(props) {
  var player = props.players_with_roles[props.current_player_id];
  var name = player.name;
  if (player.alive) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        name,
        '\u3055\u3093\u306E\u756A\u3067\u3059\uFF61 \u672C\u5F53\u306B',
        name,
        '\u3055\u3093\u3067\u3059\u304B?'
      ),
      React.createElement(
        'p',
        null,
        name,
        '\u3055\u3093\u306F',
        JapaneseNames[player.role],
        '\u3067\u3059\uFF61'
      ),
      React.createElement(
        'p',
        null,
        player.action_sentence
      ),
      React.createElement(ShowListOfPlayers, {
        current_player: player,
        current_player_id: props.current_player_id,
        players_with_roles: props.players_with_roles,
        nightActionRecord: props.nightActionRecord
      })
    );
  } else {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        name,
        '\u3055\u3093\u306F\u6B7B\u3093\u3067\u3044\u307E\u3059\uFF61'
      ),
      React.createElement(
        'button',
        {
          onClick: function onClick(e) {
            props.nextPlayer(props.current_player_id, player.role, player, Object.keys(props.players_with_roles).length);
          }
        },
        '\u6B21\u306E\u30D7\u30EC\u30FC\u30E4\u30FC\u3078'
      )
    );
  }
};

var ShowListOfPlayers = function ShowListOfPlayers(props) {
  return React.createElement(
    'div',
    null,
    props.players_with_roles.map(function (player) {
      if (player !== props.current_player && player.alive) {
        return React.createElement(
          'button',
          {
            key: player.name,
            onClick: function onClick(e) {
              props.nightActionRecord(props.current_player_id, props.current_player.role, player, Object.keys(props.players_with_roles).length);
            }
          },
          player.name,
          '\u3055\u3093\u3092\u9078\u3076\uFF61'
        );
      }
    })
  );
};

var ResultOfNight = function ResultOfNight(props) {
  var x = props.handleKilledAtNight();
  var y = props.handleWinningSide();
  var suspected_players = props.mostSuspiciousPlayer(x);
  if (y == -1) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        '\u6628\u65E5\u306E\u72A0\u7272\u8005\u306F',
        x,
        '\u3055\u3093\u3067\u3059\uFF61'
      ),
      React.createElement(
        'p',
        null,
        '\u4ECA\u3082\u3063\u3068\u3082\u7591\u308F\u308C\u3066\u3044\u308B\u306E\u306F'
      ),
      suspected_players.map(function (player) {
        return React.createElement(
          'p',
          { key: player },
          player,
          '\u3055\u3093'
        );
      }),
      React.createElement(
        'button',
        {
          onClick: props.morningPhase
        },
        '\u6B21\u3078'
      )
    );
  } else if (y == 1) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        '\u6628\u65E5\u306E\u72A0\u7272\u8005\u306F',
        x,
        '\u3055\u3093\u3067\u3059\uFF61'
      ),
      React.createElement(
        'h1',
        null,
        '\u4EBA\u72FC\u306E\u52DD\u5229!'
      ),
      React.createElement(
        'button',
        {
          onClick: props.restart
        },
        '\u3082\u30461\u30B2\u30FC\u30E0\u3059\u308B'
      )
    );
  } else if (y == 0) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        '\u6628\u65E5\u306E\u72A0\u7272\u8005\u306F',
        x,
        '\u3055\u3093\u3067\u3059\uFF61'
      ),
      React.createElement(
        'h1',
        null,
        '\u6751\u4EBA\u306E\u52DD\u5229!'
      ),
      React.createElement(
        'button',
        {
          onClick: props.restart
        },
        '\u3082\u30461\u30B2\u30FC\u30E0\u3059\u308B'
      )
    );
  }
};

var ResultOfMorning = function ResultOfMorning(props) {
  var x = props.to_be_exiled[0];
  var y = props.handleWinningSide();
  if (y == -1) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        x,
        '\u3055\u3093, \u6700\u5F8C\u306B\u907A\u8A00\u3092\u3069\u3046\u305E\uFF61'
      ),
      React.createElement(
        'button',
        {
          onClick: props.nightPhase
        },
        '\u6B21\u3078'
      )
    );
  } else if (y == 1) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        x,
        '\u3055\u3093, \u6700\u5F8C\u306B\u907A\u8A00\u3092\u3069\u3046\u305E\uFF61'
      ),
      React.createElement(
        'h1',
        null,
        '\u4EBA\u72FC\u306E\u52DD\u5229!'
      ),
      React.createElement(
        'button',
        {
          onClick: props.restart
        },
        '\u3082\u30461\u30B2\u30FC\u30E0\u3059\u308B'
      )
    );
  } else if (y == 0) {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'p',
        null,
        x,
        '\u3055\u3093, \u6700\u5F8C\u306B\u907A\u8A00\u3092\u3069\u3046\u305E\uFF61'
      ),
      React.createElement(
        'h1',
        null,
        '\u6751\u4EBA\u306E\u52DD\u5229!'
      ),
      React.createElement(
        'button',
        {
          onClick: props.restart
        },
        '\u3082\u30461\u30B2\u30FC\u30E0\u3059\u308B'
      )
    );
  }
};

var ListToBeExiled = function ListToBeExiled(props) {
  return React.createElement(
    'div',
    null,
    props.players_with_roles.map(function (player) {
      if (player.alive) {
        return React.createElement(
          'button',
          {
            key: player.name,
            onClick: function onClick(e) {
              props.exile(player);
            }
          },
          player.name,
          '\u3055\u3093\u3092\u8FFD\u653E'
        );
      }
    })
  );
};

var Counter = function (_React$Component3) {
  _inherits(Counter, _React$Component3);

  function Counter(props) {
    _classCallCheck(this, Counter);

    var _this4 = _possibleConstructorReturn(this, (Counter.__proto__ || Object.getPrototypeOf(Counter)).call(this, props));

    _this4.handleAddOne = _this4.handleAddOne.bind(_this4);
    _this4.handleMinusOne = _this4.handleMinusOne.bind(_this4);
    _this4.handleReset = _this4.handleReset.bind(_this4);
    _this4.state = {
      count: 0
    };
    return _this4;
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


  _createClass(Counter, [{
    key: 'handleAddOne',
    value: function handleAddOne() {
      this.props.updateNumberOfRoles(1, this.props.role);
      this.setState(function (prevState) {
        return {
          count: prevState.count + 1
        };
      });
    }
  }, {
    key: 'handleMinusOne',
    value: function handleMinusOne() {
      var _this5 = this;

      this.setState(function (prevState) {
        if (prevState.count === 0) {
          return;
        }
        _this5.props.updateNumberOfRoles(-1, _this5.props.role);
        return {
          count: prevState.count - 1
        };
      });
    }
  }, {
    key: 'handleReset',
    value: function handleReset() {
      this.props.updateNumberOfRoles(0, this.props.role);
      this.setState(function () {
        return {
          count: 0
        };
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          JapaneseNames[this.props.role],
          ':',
          this.state.count
        ),
        React.createElement(
          'button',
          { onClick: this.handleAddOne },
          '+1'
        ),
        React.createElement(
          'button',
          { onClick: this.handleMinusOne },
          '-1'
        ),
        React.createElement(
          'button',
          { onClick: this.handleReset },
          'reset'
        )
      );
    }
  }]);

  return Counter;
}(React.Component);

var Player = function Player(name, alive) {
  _classCallCheck(this, Player);

  this.name = name;
  this.alive = true;
};

var Villager = function (_Player) {
  _inherits(Villager, _Player);

  function Villager(name, alive, role, side, killable) {
    _classCallCheck(this, Villager);

    var _this6 = _possibleConstructorReturn(this, (Villager.__proto__ || Object.getPrototypeOf(Villager)).call(this, name, alive));

    _this6.role = 'villager';
    _this6.side = 0;
    _this6.killable = true;
    _this6.action_sentence = 'もっとも疑わしい人を一人選んでください｡';
    return _this6;
  }

  return Villager;
}(Player);

var Werewolf = function (_Player2) {
  _inherits(Werewolf, _Player2);

  function Werewolf(name, alive, role, side, killable) {
    _classCallCheck(this, Werewolf);

    var _this7 = _possibleConstructorReturn(this, (Werewolf.__proto__ || Object.getPrototypeOf(Werewolf)).call(this, name, alive));

    _this7.role = 'werewolf';
    _this7.side = 1;
    _this7.killable = true;
    _this7.action_sentence = '今晩襲う人を決めてください｡';
    return _this7;
  }

  return Werewolf;
}(Player);

var Seer = function (_Villager) {
  _inherits(Seer, _Villager);

  function Seer(name, alive, role, side, killable) {
    _classCallCheck(this, Seer);

    var _this8 = _possibleConstructorReturn(this, (Seer.__proto__ || Object.getPrototypeOf(Seer)).call(this, name, alive, side));

    _this8.role = 'seer';
    _this8.killable = true;
    return _this8;
  }

  return Seer;
}(Villager);

ReactDOM.render(React.createElement(WerewolfGame, null), document.getElementById('app'));
