import React from "react";
import { ListGroup, FormGroup, Form } from "react-bootstrap";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

export default function AutoCompleteCountry(props) {
  const getAddress = async pos => {
    if (pos) {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/getaddress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(pos)
      });
      if (res.ok) {
        try {
          const gotLocation = await res.json();
          if (gotLocation.address_components) {
            if (
              gotLocation.address_components.filter(
                idx => idx.types[0] === "locality"
              ).length !== 0 &&
              gotLocation.address_components.filter(
                idx => idx.types[0] === "administrative_area_level_1"
              ).length !== 0
            ) {
              const getCity = gotLocation.address_components.filter(
                idx => idx.types[0] === "locality"
              )[0].long_name;
              const getRegion = gotLocation.address_components.filter(
                idx => idx.types[0] === "administrative_area_level_1"
              )[0].short_name;
              props.setSearchedCity(getCity + ", " + getRegion);
            } else if (
              gotLocation.address_components.filter(
                idx => idx.types[0] === "locality"
              ).length === 0 &&
              gotLocation.address_components.filter(
                idx => idx.types[0] === "administrative_area_level_1"
              ).length !== 0
            ) {
              const getCity = gotLocation.address_components.filter(
                idx => idx.types[0] === "administrative_area_level_1"
              )[0].long_name;
              props.setSearchedCity(getCity);
            } else {
              const getCity = gotLocation.address_components.filter(
                idx => idx.types[0] === "administrative_area_level_2"
              )[0].long_name;
              props.setSearchedCity(getCity);
            }
            return;
          } else {
            alert("no results");
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  const handleSelect = async value => {
    console.log("value", value);
    const results = await geocodeByAddress(value);
    console.log("results", results);
    const latLng = await getLatLng(results[0]);
    getAddress(latLng);
    props.setMyPosition(latLng);
    props.setSearchedCity(value);
  };

  return (
    <div>
      <PlacesAutocomplete
        value={props.searchedCity}
        onChange={props.setSearchedCity}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <FormGroup>
            <Form.Control
              className="w-100"
              {...getInputProps({ placeholder: "City ..." })}
            />
            <ListGroup variant="flush">
              {loading ? <ListGroup.Item>...loading</ListGroup.Item> : null}
              {suggestions.map(suggestion => {
                return (
                  <ListGroup.Item
                    action
                    className="border"
                    {...getSuggestionItemProps(suggestion)}
                  >
                    {suggestion.description}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </FormGroup>
        )}
      </PlacesAutocomplete>
    </div>
  );
}
