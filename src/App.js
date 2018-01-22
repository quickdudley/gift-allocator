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
      <span onClick={e => {this.removeThis();}}>
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
      {title: "Add", action: () => {this.doAdd()}},
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
        onChange={e => {this.changeName(e)}}
        onKeyUp={e => {if(e.keyCode===13){this.doAdd()}}}/>
      <div>{btns}</div></div>);
  }
}

class Assignment extends Component {
  render () {
    return (<a
      href={this.props.blob}
      className={this.props.stale ? "staleAssignment" : "assignment"}
      download={this.props.name + ".txt"}
      >{this.props.name}</a>)
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      participants: [],
      number: 0,
      allocs: [],
      staleAllocs: true
     }
  }

  addParticipant(participant) {
    var sn = this.state.number;
    participant.number = sn;
    this.state.participants.push(participant);
    this.setState({number: sn + 1, staleAllocs: true});
  }

  deleteParticipant(number) {
    var i = this.state.participants.findIndex(p => {
      return p.number === number;
     });
    this.state.participants.splice(i,1);
    this.setState({staleAllocs: true});
  }

  doAllocation() {
    var existingAllocs = this.state.allocs;
    var newAllocs = {};
    var doneAllocs = [];
    for (let a of existingAllocs) {
      window.URL.revokeObjectURL(a.blob);
    }
    while(true) {
      var unallocated = this.state.participants.slice();
      var j = 0;
      while(unallocated.length !== 0) {
        var i = Math.floor(Math.random() * unallocated.length);
        var donor = unallocated[i];
        var recipient = this.state.participants[j++];
        if(donor.name === recipient.name)
          break;
        newAllocs[donor.name] = {"Your": recipient.name};
        unallocated.splice(i,1);
      }
      if(unallocated.length === 0) break;
    }
    for(let a in newAllocs) {
      var s = "";
      for(donor in newAllocs[a]) {
        s += donor + " recipient is " + newAllocs[a][donor] + "\r\n";
      }
      doneAllocs.push({
        blob: window.URL.createObjectURL(new Blob([s],{type:"text/plain"})),
        name: a
       });
    }
    this.setState({allocs: doneAllocs, staleAllocs: false});
  }

  render() {
    var participants = [];
    var allocations = [];
    for (let p of this.state.participants) {
      participants.push(<Participant object={p} root={this} key={p.number} />);
     }
    if(this.state.allocs.length > 0) {
      allocations.push(<h3>
        Allocations{this.state.staleAllocs ?
          <span className="staleTitle">&nbsp;(old: click &quot;Do Allocations&quot; to refresh)</span> :
          ""}</h3>);
     }
    for (let a of this.state.allocs) {
      allocations.push(<Assignment
        blob={a.blob}
        name={a.name}
        stale={this.state.staleAllocs} />);
     }
    return (
      <div className="App">
       <div className="twoPanel">
       <div className="participantList">
         <h3>Participants</h3>
         {participants}
         <ListEdit root={this} />
       </div>
       <div className="allocationsList">
         {allocations}
       </div>
       </div>
       <div className="finalButton">
         <button>Do Allocations</button>
       </div>
      </div>
    );
  }
}

export default App;
