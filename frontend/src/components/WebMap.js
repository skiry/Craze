import * as React from "react";
import {Component} from "react";
import Popup from "reactjs-popup";
import {Form, Checkbox} from 'semantic-ui-react'
import {Map, TileLayer, Marker, Circle} from "react-leaflet";
import L from "leaflet";
import {Popup as LeafletPopup} from 'react-leaflet';
import LocationService from "../services/LocationService";
import UserService from "../services/UserService";
import FilterGroup from "./FilterComponent.js"
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Select from 'react-select';
import { popupContent, popupHead, popupText, okText, popupModal, popupButton  } from "../styles/popup-styles";

const tags = [ 'Noise', 'Transport', 'Safety', 'Smell', 
'Neighbourhood friendliness', 'Basic facilities', 
'Traffic flow', 'Stores/services availability' 
];

const tags2 = [
  { value: 'Noise', label: 'Noise' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Smell', label: 'Smell' },
  { value: 'Neighbourhood friendliness', 
    label: 'Neighbourhood friendliness' },
  { value: 'Basic facilities', 
    label: 'Basic facilities' },
  { value: 'Traffic flow', 
    label: 'Traffic flow' },
  { value: 'Stores/services availability', 
    label: 'Stores/services availability' },
];

// https://github.com/pointhi/leaflet-color-markers
const locationPin = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const locationRadiusPoint = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default class WebMap extends Component {
  constructor() {
    super();
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this._onSelect = this._onSelect.bind(this);
    this.handleOpinionChange = this.handleOpinionChange.bind(this);
    this.handleTagClick = this.handleTagClick.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.deleteLocation = this.deleteLocation.bind(this);

    this.state = {
      lat: 0,
      lng: 0,
      description: '',
      open: false,
      openUpdate: false,
      openDelete: false,
      selectedTag: '',
      selectedTags: [],
      isPositiveOpinion: false,
      locations: [],
      displayableLocations: [],
      selectedFilteringTags: [],
      locationToUpdate: '',
      userId: -1,
      tagsClicked: [0, 0, 0, 0, 0, 0, 0, 0],
      lastTags: [],
      searchRadius: 0,
      searchCoordinates: {'lat': 46.77, 'lng': 23.58},
      searchLocationSwitch: false
    };
  }

  closeModal() {
    this.setState({
      open: false,
      description: '',
      selectedTag: '',
      isPositiveOpinion: false,
      openUpdate: false,
      openDelete: false,
      locationToUpdate: '',
      selectedTags: []
    });
  }

  componentDidMount() {
    LocationService.getLocations().then(result => {
      this.setState({locations: result.data, displayableLocations: result.data});
    }).catch(error => {
        console.log(error);
      }
    )

    UserService.getId().then(result => {
      this.setState({userId: result.data.id})
    })
  }

  handleDblClick = (event) => {
    const {lat, lng} = event.latlng;
    this.setState({
      lat: lat,
      lng: lng,
      open: true
    });
  };

  handleChange(event) {
    this.setState({description: event.target.value});
  }

  handleOpinionChange(event) {
    if (event.target.value === "positive") {
      this.setState({isPositiveOpinion: true});
    } else {
      this.setState({isPositiveOpinion: false});
    }
  }

  handleSubmit() {
    if (this.state.description.length < 2) {
      alert("The description must have at least 2 characters.");
      return null;
    }
    if (!this.state.selectedTags.length) {
      alert("Select at least one tag.");
      return null;
    }
    const locationDetails = {
      'lat': this.state.lat,
      'lng': this.state.lng,
      'description': this.state.description,
      'tag': this.listToString(this.state.selectedTags),
      'isPositiveOpinion': this.state.isPositiveOpinion
    };
    LocationService.sendLocation(locationDetails).then((response) => {
      if (response.status === 200) {
        locationDetails['tag'].split(",").forEach(tag => {
          this.addLocations(tag)
        });
        this.updateLocationsRadius();
      }
    }).catch(error => {
        console.log(error);
      }
    );
    this.closeModal();
  }

  updateLocation(location) {
    this.setState({
      locationToUpdate: location,
      openUpdate: true,
      selectedTags: this.stringToList(location.tag),
      description: location.description,
      isPositiveOpinion: location.is_positive,
      lat: location.lat,
      lng: location.lng,
    })
  }

  handleUpdate(locationId) {
    if (this.state.description.length < 2) {
      alert("The description must have at least 2 characters.");
      return null;
    }
    if (!this.state.selectedTags.length) {
      alert("Why did you delete all the tags? Put some back. NOW");
      return null;
    }
    const locationDetails = {
      'id': locationId,
      'lat': this.state.lat,
      'lng': this.state.lng,
      'description': this.state.description,
      'tag': this.listToString(this.state.selectedTags),
      'isPositiveOpinion': this.state.isPositiveOpinion
    };
    LocationService.updateLocation(locationDetails).then((response) => {
      if (response.status === 200) {
        locationDetails['tag'].split(",").forEach(tag => {
          this.addLocations(tag, locationDetails)
        });
      }
    }).catch(error => {
        console.log(error);
      }
    );
    this.closeModal();
  }

  deleteLocation(location) {
    this.setState({
      locationToUpdate: location,
      openDelete: true
    })
  }

  handleDelete(locationId) {
    const locationDetails = {
      'id': locationId
    };
    LocationService.deleteLocation(locationDetails).then((response) => {
      if (response.status === 200) {
        this.setState({
          locations: this.state.locations.filter(pin => pin.id !== locationId),
        }, () => this.updateLocationsRadius());        
      }
    }).catch(error => {
        console.log(error);
      }
    );
    this.closeModal();
  }

  _onSelect(event) {
    if (event == null) {
      this.setState({selectedTags: []});  
    }
    else {
      this.setState({selectedTags: event});
    }
  }

  listToString(tags) {
    var stringList = [];
    for (var i = 0; i < tags.length; i++){
      stringList.push(tags[i].value);
    }
    return stringList.join(',');
  }

  stringToList(tagString) {
    var tags = tagString.split(',');
    var result = [];
    for (var i = 0; i < tags.length; i++){
      result.push({'value': tags[i], 'label': tags[i]});
    }
    return result;
  }

  updateMarker = event => {
    const latLng = event.target.getLatLng(); 
    this.setState({
      searchCoordinates: latLng
    });
  };

  handleDragEnd = event => {
    if (!this.state.searchRadius) {
      this.setState({
        searchCoordinates: event.target.getCenter()
      })
    }
  }

  handleLocationSwitch = event => {
    let lastValue = this.state.searchLocationSwitch;
    if (lastValue) {
      this.setState({
        searchRadius: 0,
        searchLocationSwitch: !lastValue,
        displayableLocations: this.state.locations
      })
    }
    else {
      this.setState({
        searchRadius: 800,
        searchLocationSwitch: !lastValue
      }, () => this.updateLocationsRadius());
      
    }
  }

  handleSlide = (event, newValue) => {
    this.setState({
      searchRadius: newValue * 80
    }, () => this.updateLocationsRadius());
  }

  updateLocationsRadius = event => {
    let displayableLocations = [];
    if (this.state.searchRadius) {
      for (let i = 0; i < this.state.locations.length; ++i) {
        if (this.computeDistance(this.state.searchCoordinates, this.state.locations[i]) <= this.state.searchRadius) {
          displayableLocations.push(this.state.locations[i]);
        }
      }
    }
    else {
      displayableLocations = this.state.locations.slice();
    }
    this.setState({
      displayableLocations
    })
  }

  computeDistance(pointA, pointB) {
    var lat1, lat2, lon1, lon2;

    lat1 = pointA['lat'];
    lon1 = pointA['lng'];

    lat2 = pointB['lat'];
    lon2 = pointB['lng'];

    var R = 6371e3; // metres, earth's radius
    var φ1 = lat1 * Math.PI / 180;
    var φ2 = lat2 * Math.PI / 180
    var Δφ = (lat2-lat1) * Math.PI / 180;
    var Δλ = (lon2-lon1) * Math.PI / 180;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
  }

  Updatable(props) {
    if (props.locationUserId === props.currentUser) {
    return (
      <span>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
        <Button variant="outlined" size="small" onClick={() => props.this.updateLocation(props.location)}>
          Update
        </Button>
        <Button variant="outlined" size="small" style={{marginLeft: "30px"}} onClick={() => props.this.deleteLocation(props.location)}>
          Delete
        </Button>
        </div>
      </span>)
    }
    return null;
  }

  _getLocationPopupDescription(location) {
    const positive = location.is_positive ? 'Good' : 'Bad';
    return (<LeafletPopup>
      <header>
        <h3 style={{textAlign: "center"}}>{location.description }</h3>
        <this.Updatable locationUserId={location.user_id} currentUser={this.state.userId} location={location} this={this}/>
      </header>
      <p style={{textAlign: "center"}}>
        Evaluated as '{positive}' in the following categories: '{location.tag}'
      </p>
    </LeafletPopup>);
  }

  handleTagClick = (event, newTags) => {  
    let difference;
    const lastTags = this.state.lastTags.slice();
    if (newTags.length > this.state.lastTags.length) {
      difference = newTags.filter(x => !this.state.lastTags.includes(x));
    }
    else {
      difference = lastTags.filter(x => !newTags.includes(x));
    }

    const location = tags.indexOf(difference[0]);
    const newTagsClicked = this.state.tagsClicked.slice();
    const action = (newTagsClicked[location] + 1) % 3;
    newTagsClicked[location] = action;
    this.setState({
      tagsClicked: newTagsClicked
    }); 

    if (!newTagsClicked.reduce((a, b) => a + b, 0)) {
      LocationService.getLocations().then(result => {
        this.setState({
          locations: result.data
        }, () => this.updateLocationsRadius());
      }).catch(error => {
        console.log(error);
      });
    } else {
      this.addLocations(difference[0]);
    }
    this.setState({
      selectedFilteringTags: newTags,
      lastTags: newTags
    });
  };

  haveTag = (element) => {
    for (let i = 0; i < this.state.locations.length; ++i) {
      if (this.state.locations[i].id === element.id) {
        return true;
      }
    }
    return false;
  }

  /*
  status 0 -> add all; positive and negative
  status 1 -> add all positives, remove negatives; if tag is positive, keep
  status 2 -> add negatives, remove positives; if tag is negative, keep
   */

  addLocations = (tag, newlyAdded=null) => {
    LocationService.getLocationsByTags(tag).then(result => {
      let newLocations = result.data.filter(location => this.checkAllTags(location));
      let pinsWithOtherTags = this.state.locations.filter(pin => !this.containsTag(pin.tag.split(","), tag));
      let finalPins = pinsWithOtherTags.concat(newLocations);
      if (newlyAdded) {
        for( var i = 0; i < finalPins.length; i++){ 
           if ( finalPins[i]['id'] === newlyAdded['id']) {
             finalPins.splice(i, 1); 
             i--;
           }
        }
        newlyAdded['is_positive'] = newlyAdded['isPositiveOpinion'];
        newlyAdded['user_id'] = this.state.userId;
        delete newlyAdded['isPositiveOpinion'];
        finalPins.push(newlyAdded);
      }
      this.setState({locations: finalPins}, () => this.updateLocationsRadius());
    }).catch(error => {
        console.log(error);
      }
    );
  };

  checkAllTags = (location) => {
    let result = true;
    location.tag.split(",").forEach(tag => {
    let index = tags.indexOf(tag);
    let action = this.state.tagsClicked[index];
    if (action === 1 && location['is_positive'] === false)
      result = false;
    else if (action === 2 && location['is_positive'] === true)
      result = false;
    });
    return result;
  };

  containsTag(tags, tag) {
    return tags.indexOf(tag) !== -1;
  }

  render() {

    let searchPin = null;
    if (this.state.searchRadius) {
      searchPin = 
          <Marker
            icon={locationRadiusPoint}
            position={this.state.searchCoordinates}
            draggable={true}
            onDrag={this.updateMarker}
            onDragend={this.updateLocationsRadius}
          >            
            <Circle 
              center={this.state.searchCoordinates} 
              fillColor="red"
              radius={this.state.searchRadius} 
              stroke={false} 
            />
          </Marker>
    }

    let locations = this.state.displayableLocations.map((location) => {
      return (
        <Marker
          key={location['id']}
          icon={locationPin}
          position={[
            location['lat'],
            location['lng']
          ]}>
          {this._getLocationPopupDescription(location)}
        </Marker>
      )
    });

    let slider = null;
    if (this.state.searchLocationSwitch) {
            slider = (
                    <Slider
                      aria-label="custom thumb label"
                      defaultValue={10}
                      style={{width: '50%', marginLeft: 'auto', marginRight: '0'}}
                      onChange={this.handleSlide}
                      onMouseUp={this.updateLocationsRadius}
                      step={0.2}
                    /> )
    }

    return (
      <div>
        <FilterGroup tags={tags}
                     selectedFilteringTags={this.state.selectedFilteringTags}
                     tagsClicked={this.state.tagsClicked}
                     handleTagClick={this.handleTagClick}/>
        <div style={{display: 'flex'}}>
          <Tooltip title="Select location" placement="right">
            <Switch
              checked={this.searchLocationSwitch}
              onChange={this.handleLocationSwitch}
              color="primary"
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          </Tooltip>
          {slider}
        </div>
        <Map
          center={[46.77, 23.58]}
          zoom={13}
          onDragend={this.handleDragEnd}
          doubleClickZoom={false}
          onDblClick={this.handleDblClick}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {locations}
          {searchPin}
        </Map>

        <Popup
          open={this.state.open}
          onClose={this.closeModal}
          modal
          closeOnDocumentClick>
          <div style={popupContent}>
              <div style={popupText}>
                <h3 style={popupHead}> Add a description </h3>
                <input 
                  type="text" 
                  value={this.state.description} 
                  onChange={this.handleChange} 
                  style={popupModal}
                  placeholder='Write here'/>
                <Select
                  styles={popupModal}
                  options={tags2} 
                  onChange={this._onSelect} 
                  isMulti
                  value={this.state.selectedTags} />
              </div>
              <Form>
                <Form.Field style={okText}>
                  How would you evaluate the experience: <b>{this.state.value}</b>
                </Form.Field >
                <Form.Field style={okText}>
                  <Checkbox
                    radio
                    label='positive'
                    name='checkboxRadioGroup'
                    value='positive'
                    checked={this.state.isPositiveOpinion === true}
                    onChange={this.handleOpinionChange}
                  />
                </Form.Field>
                <Form.Field style={okText}>
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
              <input type="submit" value="Submit" style={popupButton} onClick={this.handleSubmit}/>
          </div>
        </Popup>

        <Popup
          open={this.state.openUpdate}
          onClose={this.closeModal}
          modal
          closeOnDocumentClick>
            <div style={popupContent}>
              <div style={popupText}>
                <h3 style={popupHead}> Update the description </h3>
                <input 
                  type="text" 
                  value={this.state.description} 
                  onChange={this.handleChange} 
                  style={popupModal}
                  placeholder='Write here'/>
                <Select 
                  options={tags2} 
                  onChange={this._onSelect} 
                  value={this.state.selectedTags}
                  isMulti
                  placeholder={this.state.selectedTags} />
              </div>
              <Form>
                <Form.Field style={okText}>
                  How would you evaluate now the experience: <b>{this.state.value}</b>
                </Form.Field>
                <Form.Field style={okText}>
                  <Checkbox
                    radio
                    label='positive'
                    name='checkboxRadioGroup'
                    value='positive'
                    checked={this.state.isPositiveOpinion === true}
                    onChange={this.handleOpinionChange}
                  />
                </Form.Field>
                <Form.Field style={okText}>
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
              <input type="submit" value="Update" style={popupButton} onClick={() => this.handleUpdate(this.state.locationToUpdate.id)}/>
             </div>
        </Popup>

        <Popup
          open={this.state.openDelete}
          onClose={this.closeModal}
          modal
          closeOnDocumentClick>
            <div style={popupContent}>
              <div style={popupText}>
                <h3 style={popupHead}> Delete the location pin </h3>
                <input 
                  type="text" 
                  readOnly
                  value={this.state.locationToUpdate.description} 
                  onChange={this.handleChange} 
                  style={popupModal}
                  placeholder='Write here'/>
                <Select 
                  options={tags2} 
                  isDisabled={true}
                  onChange={this._onSelect} 
                  placeholder={this.state.locationToUpdate.tag}/>
               </div>
              <Form>
                <Form.Field style={okText}>
                  The experience is evaluated as:
                </Form.Field>
                <Form.Field style={okText}>
                  <Checkbox
                    radio
                    label='positive'
                    name='checkboxRadioGroup'
                    value='positive'
                    checked={this.state.locationToUpdate.is_positive === true}
                  />
                </Form.Field>
                <Form.Field style={okText}>
                  <Checkbox
                    radio
                    label='negative'
                    name='checkboxRadioGroup'
                    value='negative'
                    checked={this.state.locationToUpdate.is_positive === false}
                  />
                </Form.Field>
             </Form>
              <input type="submit" value="Delete" style={popupButton} onClick={() => this.handleDelete(this.state.locationToUpdate.id)}/>
              </div>
        </Popup>
      </div>
    );
  }
}
