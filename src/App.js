import React, { Component } from 'react';
import './App.css';

class Participant extends Component {
  render() {
    return (
      <div classname="Participant">{this.props.object.name}</div>
    );
  }
}

class ListEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ""
     };
  }

  changeName(e) {
    this.setState({name: e.target.value});
  }

  doAdd(e) {
    this.props.root.addParticipant({name: this.state.name});
    this.setState({name: ""});
  }
  
  render() {
    var btns = this.props.editing ? [
      {title: "Cancel", action: () => {}},
      {title: "Save", action: () => {}}
     ] : [
      {title: "Add", action: () => {
        this.doAdd();
       }},
      {title: "Clear", action: () => {
        this.setState({name: ""});
       }}
     ];
    btns = btns.map(btn => {
      return (<button onClick={btn.action}>{btn.title}</button>)
     });
    return (<div className="ListEdit">
      <input type="text" value={this.state.name}
        onChange={e => {this.changeName(e)}}/>
      <div>{btns}</div></div>);
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      participants: [],
      number: 0
     }
  }

  addParticipant(participant) {
    var sn = this.state.number;
    participant.number = sn;
    this.state.participants.push(participant);
    this.setState({number: sn + 1});
  }
  
  render() {
    var participants = [];
    for (let p of this.state.participants) {
      participants.push(<Participant object={p} key={p.number} />);
     }
    return (
      <div className="App">
       <div className="participantList">{participants}
       <ListEdit root={this}/></div>
      </div>
    );
  }
}

export default App;
