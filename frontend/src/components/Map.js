/* eslint-disable no-param-reassign */
/* eslint-disable react/no-unused-state  */

import React, { Component } from 'react';
import Sketch from 'react-p5';
import Mappa from 'mappa-mundi';
import Popup from "reactjs-popup";
import LocationService from '../services/LocationService'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import { Form, Checkbox } from 'semantic-ui-react'

const tags = [ 'Noise', 'Transport', 'Safety' ]

function setup(obj) {
  return (p5, canvasParentRef) => {
    const mappa = new Mappa('Leaflet');
    const canvas = p5.createCanvas(700, 500).parent(canvasParentRef);
    const options = {
      lat: 0,
      lng: 0,
      zoom: 2,
      style: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
    };
    const myMap = mappa.tileMap(options);
    myMap.overlay(canvas);

    obj.setState({
      myMap,
      ...obj.state,
    });
  };
}

function draw(obj) {
  return (p5) => {
    p5.clear();
    p5.fill(255, 0, 0);

    const { clickedLocations } = obj.state;

    clickedLocations.forEach((item) => {
      const pos = obj.state.myMap.latLngToPixel(item.lat, item.lng);
      p5.ellipse(pos.x, pos.y, 10, 10);
    });
  };
}

function mousePressed(obj) {
  return (p5) => {
    const position = obj.state.myMap.pixelToLatLng(p5.mouseX, p5.mouseY);

    obj.setState({
      position: `You clicked at ${position.lat} ${position.lng}.`,
      clickedLocations: [...obj.state.clickedLocations, { lat: position.lat, lng: position.lng }],
      lat: position.lat,
      lng: position.lng,
      open: true
    });
  };
}

// https://stackoverflow.com/questions/48048957/react-long-press-event
function handleButtonPress(obj) {
  return (p5) => {
    obj.buttonPressTimer = setTimeout(() => mousePressed(obj)(p5), 800);
  };
}

function handleButtonRelease(obj) {
  return () => {
    clearTimeout(obj.buttonPressTimer);
  };
}

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.handleButtonPress = handleButtonPress(this).bind(this);
    this.handleButtonRelease = handleButtonRelease(this).bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this.handleOpinionChange = this.handleOpinionChange.bind(this);

    this.state = {
      position: 'No clicking yet.',
      clickedLocations: [],
      lat: 0,
      lng: 0,
      description: '',
      open: false,
      selectedTag: tags[0],
      isPositiveOpinion: false
    };
  }

  closeModal() {
    this.setState({
      open: false,
      description: '',
      selectedTag: tags[0],
      isPositiveOpinion: false
     });
  }

  handleChange(event) {
    this.setState({ description: event.target.value });
  }

  handleOpinionChange(event) {
    if (event.target.value == "positive") {
      this.setState({ isPositiveOpinion: true });
    } else {
      this.setState({ isPositiveOpinion: false });
    }
  }

  handleSubmit(event) {
    const locationDetails = {
      'lat' : this.state.lat,
      'lng': this.state.lng,
      'description': this.state.description,
      'tag': this.state.selectedTag,
      'isPositiveOpinion': this.state.isPositiveOpinion
    };
    LocationService.sendLocation(locationDetails);
    this.closeModal();
  }

  _onSelect(event) {
    this.setState({ selectedTag: event.value });
  }

  render() {
    const { position } = this.state;
    const defaultOption = tags[0];

    return (
      <div>
        <Sketch
          setup={setup(this)}
          draw={draw(this)}
          mousePressed={handleButtonPress(this)}
          mouseReleased={handleButtonRelease(this)}
        />
        <p id="position">{position}</p>
        <Popup
          open={this.state.open}
          onClose={this.closeModal}
          modal
          closeOnDocumentClick>
          <div>
            <h3> Add a description </h3>
            <input type="text" value={this.state.description} onChange={this.handleChange} />
            <Dropdown options={tags} onChange={this._onSelect} value={this.state.selectedTag} />
            <Form>
              <Form.Field>
                How would you evaluate the experience: <b>{this.state.value}</b>
              </Form.Field>
              <Form.Field>
              <Checkbox
                radio
                label='positive'
                name='checkboxRadioGroup'
                value='positive'
                checked={this.state.isPositiveOpinion === true}
                onChange={this.handleOpinionChange}
              />
              </Form.Field>
              <Form.Field>
              <Checkbox
                radio
                label='negative'
                name='checkboxRadioGroup'
                value='negative'
                checked={this.state.isPositiveOpinion === false}
                onChange={this.handleOpinionChange}
              />
              </Form.Field>
            </Form>
            <input type="submit" value="Submit" onClick={this.handleSubmit}/>
          </div>
        </Popup>
      </div>
    );
  }
}
