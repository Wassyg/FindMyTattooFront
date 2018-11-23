//Alimente le modal envoyé au tatoueur depuis le UserPage/FavTattoosProfile et depuis TattooModal/TattooArtistCardModal

import React from 'react';

//material UI
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

//reactstrap
import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import {connect} from 'react-redux';


class ProjectForm extends React.Component {
 constructor(props){
   super(props);
   this.handleNext = this.handleNext.bind(this);
   this.handlePrev = this.handlePrev.bind(this);
   this.handleChange = this.handleChange.bind(this);
   this.renderStepActions = this.renderStepActions.bind(this);
   this.toggle = this.toggle.bind(this);
   this.state ={
     finished: false,
     stepIndex: 0,
     description: "",
     phone:"",
     availability:"",
     value: "Définissez un créneau",
     visible: false,
     artistName:'',
     artistEmail:''
   }
 }

 toggle() {
   this.setState({
       visible:!this.state.visible
     });
 }
componentDidMount(){
  var ctx = this;
//collecter les informations de l'artiste depuis la DB
  fetch('http://localhost:3000/artist?artist_id='+this.props.artistId)
  .then(function(response) {
    return response.json();
  })
  .then(function(data) {
     ctx.setState({
       artistName: data.result.artistNickname,
       artistEmail: 'noel@lacapsule.academy'
     })
     })
   .catch(function(error) {
    console.log('Request failed', error);
  });
}

componentDidUpdate(prevProps){
  if(this.props.clickToSend !==prevProps.clickToSend){
    this.setState({
      visible: !this.state.visible
    })
  }
}

 handleChange(event,index, value) {
     this.setState({
       [event.target.name]: event.target.value,
       value:value
     });
   }


//fetch update à mettre en place pour BDD User
  handleNext(){
    console.log("this.state", this.state);
  var ctx = this;
    fetch('http://localhost:3000/newlead', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: 'userID='+this.props.userID +'&artistID='+this.props.artistId +'&dateLead='+ Date.now()
    });

    ctx.setState({
      stepIndex: this.state.stepIndex + 1,
      finished: this.state.stepIndex >= 2,
    })

//si on est sur la dernière page du form, envoyer les informations (user depuis le Store et tatoueur depuis la DB) au tatoueur à travers Zapier
    if(this.state.stepIndex === 2){
      // console.log("this.props.userEmail ==>" + this.props.userEmail + "this.state.artistName==>" + this.state.artistName + "this.props.userTelephone" + this.state.phone);

      //wguerrouani@gmail.com

      fetch('https://hooks.zapier.com/hooks/catch/4067341/cbsyve/', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: 'artistName='+this.state.artistName+'&artistEmail='+this.state.artistEmail+'&userFirstName='+this.props.userFirstName+'&userEmail='+this.props.userEmail+'&userTelephone='+this.state.phone+'&userTattooDescription='+this.state.description+'&userAvailability='+this.state.value+'&userFavoriteTattoo='+this.props.userFavoriteTattoo
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log(data)
         })
       .catch(function(error) {
        console.log('Request failed', error);
      });
    }
  };

  handlePrev(){
    if (this.state.stepIndex > 0){
      this.setState({
        stepIndex: this.state.stepIndex - 1
      });
    }
  };

  renderStepActions(step) {
    const {stepIndex} = this.state;

    return (
      <div style={{margin: '12px 0'}}>
        <RaisedButton
          label={stepIndex === 2 ? 'Envoyer':'Suivant'}
          disableTouchRipple={true}
          disableFocusRipple={true}
          primary={true}
          onClick={this.handleNext}
          style={{marginRight: 12}}
        />
        {step > 0 && (
          <FlatButton
            label="Précédent"
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onClick={this.handlePrev}
          />
        )}
      </div>
    );
  }

  render() {
    console.log("userID donc store OK", this.props.userID);
    const {finished, stepIndex, description, phone, availability, value} = this.state;
    return (
  <MuiThemeProvider>
    {/* <Button color="danger" onClick={this.toggle}>Formulaire</Button> */}
    <div style={{maxHeight: 400, margin: 'auto'}}>
    <Modal isOpen={this.state.visible} toggle={this.toggle}>
      <ModalHeader toggle={this.toggle}></ModalHeader>
      <ModalBody>

        <Stepper activeStep={stepIndex} orientation="vertical">
          <Step>
            <StepLabel className="stepLabelForm">Décrivez votre projet</StepLabel>
            <StepContent>
              <TextField
                name="description"
                hintText="ex : une fleur en dot sur l'omoplate"
                multiLine={true}
                floatingLabelText="Parlez nous de votre projet"
                rows={2}
                rowsMax={3}
                fullWidth={true}
                onChange={this.handleChange}
                value={this.state.description}
              />
              {this.renderStepActions(0)}
            </StepContent>
          </Step>
          <Step>
            <StepLabel className="stepLabelForm">Pour être contacté</StepLabel>
            <StepContent>
              <TextField
                name="phone"
                floatingLabelFixed="Votre numéro de téléphone"
                floatingLabelText="Laissez votre numéro au tatoueur"
                hintText="(+33)6 61 23 45 67"
                fullWidth={true}
                onChange={this.handleChange}
                value={this.state.phone}
              />
              {this.renderStepActions(1)}
            </StepContent>
          </Step>
          <Step>
            <StepLabel className="stepLabelForm">Vous préférez être contacté</StepLabel>
            <StepContent>
              <SelectField
                  name="availability"
                  fullWidth={true}
                  onChange={this.handleChange}
                  value={this.state.value}>

                  <MenuItem value="Définissez un créneau" primaryText="Définissez un créneau" />
                  <MenuItem value="midi (entre 12h et 14h)"
                    primaryText="midi (entre 12h et 14h)" />
                  <MenuItem value="après-midi (entre 14h et 17h)"
                    primaryText="après-midi (entre 14h et 17h)" />
                  <MenuItem value="soir (entre 17h et 19h)"
                    primaryText="soir (entre 17h et 19h)" />
              </SelectField>
              {this.renderStepActions(2)}
            </StepContent>
          </Step>
        </Stepper>
        {finished && (<p style={{margin: '20px 0', textAlign: 'center'}}>Votre demande a bien été envoyée à {this.state.artistName} !</p>)}
      </ModalBody>
    </Modal>
    </div>
  </MuiThemeProvider>
    );
  }
}

function mapStateToProps(store) {
  console.log("user depuis le reducer", store.user);
  return {
    userID: store.user._id,
    userFirstName: store.user.userFirstName,
    userEmail: store.user.userEmail,
    userTelephone: store.user.userTelephone,
    userFavoriteTattoo: store.user.userFavoriteTattoo,
    userTattooDescription: store.user.userTattooDescription,
    userAvailability: store.user.userAvailability
  }

}

export default connect(
    mapStateToProps,
    null
)(ProjectForm);
