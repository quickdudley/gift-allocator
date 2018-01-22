import React, { Component } from 'react';
import './App.css';
import closebox from './close.svg';

class Participant extends Component {
  removeThis() {
    this.props.root.deleteParticipant(this.props.object.number);
  }

  selectThis() {
    console.log(this);
    this.props.root.selectParticipant(this.props.object);
  }

  render() {
    return (
      <div className="Participant">
      <span onClick={e => {this.removeThis();}}>
      <img src={closebox} alt="Remove" className="closeBox"
        /></span><span
        className={this.props.object.selected ? "selectedParticipant" : ""}
        onClick={e => {this.selectThis();}}
        >{this.props.object.name}{
        this.props.object.assistance ?
          <span className="assistanceNote">&nbsp;{
            "{" + this.props.object.assistance.join(", ") + "}"
          }</span> :
          ""
        }</span></div>
    );
  }
}

class ListEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.editing ? this.props.editing.name : ""
     };
  }

  changeName(e) {
    this.setState({name: e.target.value});
  }

  doAdd(e) {
    this.props.root.addParticipant({name: this.state.name});
    this.setState({name: ""});
  }

  doDeselect() {
    this.props.root.deselectParticipant();
  }

  doSave() {
    this.props.editing.name = this.state.name;
    this.props.root.deselectParticipant();
    this.setState({name: ""});
  }

  componentWillReceiveProps(nextProps) {
    this.setState({name: nextProps.editing ? nextProps.editing.name : ""});
  }
  
  render() {
    var btns = this.props.editing ? [
      {title: "Cancel", action: () => {this.doDeselect();}},
      {title: "Save", action: () => {this.doSave();}}
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
        onKeyUp={e => {if(e.keyCode===13){
          if(this.props.editing){this.doSave();}
          else {this.doAdd();}
          }}}/>
      <div>{btns}</div></div>);
  }
}

class Assignment extends Component {
  render () {
    return (<div><a
      href={this.props.blob}
      className={this.props.stale ? "staleAssignment" : "assignment"}
      download={this.props.name + ".txt"}
      >{this.props.name}</a></div>)
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      participants: [],
      number: 0,
      allocs: [],
      staleAllocs: true,
      participantSelected: false
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

  selectParticipant(participant) {
    for(let p of this.state.participants) {
      p.selected = false;
    }
    participant.selected = true;
    this.setState({participantSelected: participant});
  }

  deselectParticipant() {
    for(let p of this.state.participants) {
      p.selected = false;
    }
    this.setState({participantSelected: false});
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
    for(donor of this.state.participants) {
      if(donor.assistance) {
        // eslint-disable-next-line
        var assistance = donor.assistance.filter(a => {
          return newAllocs[donor.name]["Your"] !== a;
        });
        i = Math.floor(Math.random() * assistance.length);
        assistance = assistance[i];
        for(let d2 of newAllocs[donor.name]) {
          newAllocs[assistance][d2 === "Your" ? donor.name + "'s" : d2] =
            newAllocs[donor.name][d2];
        }
        delete newAllocs[donor.name];
      }
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
          <span className="staleTitle">&nbsp;(click &quot;Do Allocations&quot; to refresh)</span> :
          ""}</h3>);
     }
    for (let a of this.state.allocs) {
      allocations.push(<Assignment
        blob={a.blob}
        name={a.name}
        stale={this.state.staleAllocs} />);
     }
    var insufficient = this.state.participants.length < 2;
    return (
      <div className="App">
       <div className="twoPanel">
       <div className="participantList">
         <h3>Participants</h3>
         {participants}
         <ListEdit root={this} editing={this.state.participantSelected} />
       </div>
       <div className="allocationsList">
         {allocations}
       </div>
       </div>
       <div className="finalButton">
         <button
           disabled={insufficient}
           onClick={() => {this.doAllocation();}}>Do Allocations</button>
         {insufficient ?
          <p className="needtwo">At least two participants are needed</p> : ""}
       </div>
      </div>
    );
  }
}

export default App;
