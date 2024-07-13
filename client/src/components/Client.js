import React from "react";
import Avatar from "react-avatar";
import PropTypes from "prop-types";
import "../fonts/stylesheet.css";

function Client({ username }) {
  const displayName = username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div className=" Geist flex flex-col items-center ">
      <Avatar name={displayName} size={55} round="50%" className="text-2xl font-bold mb-2" />
      <span className="text-center text-base">{displayName}</span>
    </div>
  );
}

Client.propTypes = {
  username: PropTypes.string.isRequired,
};

export default Client;
