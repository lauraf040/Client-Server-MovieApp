import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { SelectButton } from "primereact/selectbutton";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

function MemberForm(props) {
  const { cId } = useParams(props);
  const { movieId } = useParams(props);

  const [member, setMember] = useState({
    name: "",
    role: "",
    movieId: movieId,
  });
  const loadMember = async (cId, movieId) => {
    if (cId && cId !== "new") {
      const response = await fetch(`/movies/${movieId}/crewmembers/${cId}`);
      if (response.status === 200) {
        setMember(await response.json());
      }
    }
  };
  useEffect(() => loadMember(cId, movieId), [cId, movieId]);

  function set(property, value) {
    const record = { ...member };
    record[property] = value;
    setMember(record);
  }
  function validate(property, value) {
    if (property === "role") {
      if (value !== "-") {
        set(property, value);
      }
    }
  }
  const navigate = useNavigate();

  async function saveMember() {
    if (cId === "new") {
      const response = await fetch(`/movies/${movieId}/crewmembers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(member),
      });

      const location = response.headers.get("Location");
      const idMember = location.split("/")[5];
      if (response.status === 200) {
        member["id"] = idMember;
        navigate(`/movies/${movieId}/crewMembers`);
      }
    } else {
      const response = await fetch(`/movies/${movieId}/crewmembers/${cId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(member),
      });
      if (response.status === 200) {
        navigate(`/movies/${movieId}/crewMembers`);
      }
    }
  }
  async function deleteMember() {
    if (member.id && member.id !== "new") {
      const response = await fetch(`/movies/${movieId}/crewmembers/${cId}`, {
        method: "DELETE",
      });
      if (response.status === 200) {
        navigate(`/movies/${movieId}/crewMembers`);
      }
    }
  }

  function back() {
    navigate(`/movies/${movieId}/crewMembers`);
  }
  const roluriSelectate = [
    { label: "DIRECTOR", value: "DIRECTOR" },
    { label: "WRITER", value: "WRITER" },
    { label: "PRODUCER", value: "PRODUCER" },
    { label: "ACTOR", value: "ACTOR" },
  ];

  return (
    <div>
      <div className="form">
        <Button className="btnBack" onClick={back}>
          BACK
        </Button>
        <InputText
          className="input"
          placeholder="Introduceti numele"
          value={member.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <SelectButton
          className="input"
          value={member.role}
          display="chip"
          options={roluriSelectate}
          onChange={(e) => set("role", e.target.value)}
        />
        <div>
          <Button onClick={saveMember}>SAVE</Button>
        </div>

        <Button onClick={deleteMember} className="p-button-danger">
          DELETE
        </Button>
      </div>
    </div>
  );
}

export default MemberForm;
