import React, { Component } from 'react';
import './App.css';
import closebox from './close.svg';

class Participant extends Component {
  removeThis() {
    this.props.root.deleteParticipant(this.props.object.number);
  }

  render() {
    return (
      <div className="Participant">
      <span onClick={e => {this.removeThis()}}>
      <img src={closebox} alt="Remove" className="closeBox"
        /></span>{this.props.object.name}</div>
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
    var key = 0;
    btns = btns.map(btn => {
      return (<button onClick={btn.action} key={key++}>{btn.title}</button>)
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

  deleteParticipant(number) {
    var i = this.state.participants.find(p => {
      return p.number === number;
     });
    this.state.participants.splice(i,1);
    this.forceUpdate();
  }
  
  render() {
    var participants = [];
    for (let p of this.state.participants) {
      participants.push(<Participant object={p} root={this} key={p.number} />);
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
