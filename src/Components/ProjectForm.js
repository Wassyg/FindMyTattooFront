//// Form where user writes down information on his tattoo project to give it to the artist ////


/* Importing key components */
import React from 'react';
import {connect} from 'react-redux';

/* Importing styles and images */
import {Step, Stepper, StepLabel, StepContent} from 'material-ui/Stepper';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {Modal, ModalHeader, ModalBody} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

/* Importing key components */
import backendServerAddress from '../Assets/backendServerPath.js';

class ProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.renderStepActions = this.renderStepActions.bind(this);
    this.toggle = this.toggle.bind(this);
    this.state = {
      finished: false,
      stepIndex: 0,
      description: "",
      phone: "",
      availability: "",
      value: "Définissez un créneau",
      visible: false,
      artistName: '',
      artistEmail: ''
    }
  }

  toggle() {
    this.setState({
      visible: !this.state.visible
    });
  }
  componentDidMount() {
    var ctx = this;
    //Ask the server for the artist information from its ID
    fetch(backendServerAddress.current+'/artist?artist_id=' + ctx.props.artistID)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      ctx.setState({
        artistName: data.result.artistNickname,
        artistEmail: 'francois.fitzpatrick@gmail.com'
      });
    })
    .catch(function(error) {
      console.log('Request failed', error);
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.clickToSend !== prevProps.clickToSend) {
      this.setState({
        visible: !this.state.visible
      })
    }
  }

  handleChange(event, index, value) {
    this.setState({
      [event.target.name]: event.target.value,
      value: value
    });
  }

  handleNext() {
    this.setState({
      stepIndex: this.state.stepIndex + 1,
      finished: this.state.stepIndex >= 2
    })

    //si on est sur la dernière page du form, envoyer les informations (user depuis le Store et tatoueur depuis la DB) au tatoueur à travers Zapier
    if (this.state.stepIndex >= 2) {
      var ctx = this;
      //Ask the server to create a new lead
      fetch(backendServerAddress.current+'/newlead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'userID=' + ctx.props.userID + '&artistID=' + ctx.props.artistID + '&userAvailability=' + ctx.state.value + "&userTattooDescription=" + ctx.state.description + '&userTelephone=' + ctx.state.phone
      })
      .catch(function(error) {
        console.log('Request failed', error);
      });
      //Ask the Zapier server to send a mail to artist if the relevant information -- as a test it sends a mail to francois.fitzpatrick@gmail.com
      fetch('https://hooks.zapier.com/hooks/catch/4318991/0ewh7z/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'artistName=' + ctx.state.artistName + '&artistEmail=' + ctx.state.artistEmail + '&userFirstName=' + ctx.props.userFirstName + '&userEmail=' + ctx.props.userEmail + '&userTelephone=' + ctx.state.phone + '&userTattooDescription=' + ctx.state.description + '&userAvailability=' + ctx.state.value + '&userFavoriteTattoo=' + ctx.props.userFavoriteTattoo
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        console.log("pour zapier",data)
      })
      .catch(function(error) {
        console.log('Request failed', error);
      });
    }
  };

  handlePrev() {
    if (this.state.stepIndex > 0) {
      this.setState({
        stepIndex: this.state.stepIndex - 1
      });
    }
  };

  renderStepActions(step) {
    const {stepIndex} = this.state;

    return (<div style={{
        margin: '12px 0'
      }}>
      <RaisedButton label={stepIndex === 2
          ? 'Envoyer'
          : 'Suivant'} disableTouchRipple={true} disableFocusRipple={true} primary={true} onClick={this.handleNext} style={{
          marginRight: 12
        }}/> {step > 0 && (<FlatButton label="Précédent" disabled={stepIndex === 0} disableTouchRipple={true} disableFocusRipple={true} onClick={this.handlePrev}/>)}
    </div>);
  }

  render() {
    const {
      finished,
      stepIndex,
      description,
      phone,
      availability,
      value
    } = this.state;

    return (
      <MuiThemeProvider>
      {/* <Button color="danger" onClick={this.toggle}>Formulaire</Button> */}
      <div style={{
          maxHeight: 400,
          margin: 'auto'
        }}>
        <Modal isOpen={this.state.visible} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Partagez dès maintenant votre projet avec {this.state.artistName}</ModalHeader>
          <ModalBody>

            <Stepper activeStep={stepIndex} orientation="vertical">
              <Step>
                <StepLabel className="stepLabelForm">Décrivez votre projet</StepLabel>
                <StepContent>
                  <TextField name="description" hintText="ex : une fleur en dot sur l'omoplate" multiLine={true} floatingLabelText="Parlez nous de votre projet" rows={2} rowsMax={3} fullWidth={true} onChange={this.handleChange} value={this.state.description}/> {this.renderStepActions(0)}
                </StepContent>
              </Step>
              <Step>
                <StepLabel className="stepLabelForm">Pour être contacté</StepLabel>
                <StepContent>
                  <TextField name="phone" floatingLabelFixed={true} floatingLabelText="Laissez votre numéro au tatoueur" hintText="0658739278" fullWidth={true} onChange={this.handleChange} value={this.state.phone}/> {this.renderStepActions(1)}
                </StepContent>
              </Step>
              <Step>
                <StepLabel className="stepLabelForm">Vous préférez être contacté</StepLabel>
                <StepContent>
                  <SelectField name="availability" fullWidth={true} onChange={this.handleChange} value={this.state.value}>

                    <MenuItem value="Définissez un créneau" primaryText="Définissez un créneau"/>
                    <MenuItem value="le midi (entre 12h et 14h)" primaryText="le midi (entre 12h et 14h)"/>
                    <MenuItem value="l'après-midi (entre 14h et 17h)" primaryText="l'après-midi (entre 14h et 17h)"/>
                    <MenuItem value="le soir (entre 17h et 19h)" primaryText="le soir (entre 17h et 19h)"/>
                  </SelectField>
                  {this.renderStepActions(2)}
                </StepContent>
              </Step>
            </Stepper>
            {
              finished && (<p style={{
                  margin: '20px 0',
                  textAlign: 'center'
                }}>Votre demande a bien été envoyée à {this.state.artistName}
                !</p>)
            }
          </ModalBody>
        </Modal>
      </div>
    </MuiThemeProvider>);
  }
}

function mapStateToProps(store) {
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
