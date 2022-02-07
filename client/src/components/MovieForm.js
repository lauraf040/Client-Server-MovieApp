import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { SelectButton } from "primereact/selectbutton";
import { FilterMatchMode } from "primereact/api";

function MovieForm(props) {
  const { mId } = useParams(props);
  const [movie, setMovie] = useState({
    title: "",
    category: "",
    publishDate: "",
  });

  const [members, setMembers] = useState([]);
  const [page, setPage] = useState(0);
  const [first, setFirst] = useState(0);

  const loadMovie = async (mId) => {
    console.warn(mId);
    if (mId && mId !== "new") {
      const response = await fetch(`/movies/${mId}`);
      if (response.status === 200) {
        setMovie(await response.json());
      }
    }
  };

  const loadMembers = async (mId) => {
    const response = await fetch(`/movies/${mId}/crewmembers`);
    if (response.status === 200) {
      setMembers(await response.json());
    }
  };

  useEffect(() => loadMovie(mId), [mId]);
  useEffect(() => loadMembers(mId), [mId]);

  function set(property, value) {
    const record = { ...movie };
    record[property] = value;
    setMovie(record);
  }

  function validate(property, value) {
    if (property === "category") {
      if (value !== "-") {
        set(property, value);
      }
    }
  }

  const navigate = useNavigate();

  async function saveMovie() {
    if (mId === "new") {
      const response = await fetch("/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movie),
      });

      const location = response.headers.get("Location");
      const idMovie = location.split("/")[5];
      if (response.status === 200) {
        movie["id"] = idMovie;
        navigate("/");
      }
    } else {
      const response = await fetch(`/movies/${mId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movie),
      });
      if (response.status === 200) {
        navigate("/");
      }
    }
  }

  async function deleteMovie() {
    if (movie.id && movie.id !== "new") {
      const response = await fetch(`/movies/${mId}`, {
        method: "DELETE",
      });
      if (response.status === 200) {
        navigate("/");
      }
    }
  }
  const filteredMovies = members.filter((m) => m.movieId === movie.id);
  const categoriiSelectate = [
    { label: "ACTION", value: "ACTION" },
    { label: "COMEDY", value: "COMEDY" },
    { label: "THRILLER", value: "THRILLER" },
    { label: "HORROR", value: "HORROR" },
    { label: "ANIMATION", value: "ANIMATION" },
  ];

  //paginare
  const handlePageChange = (e) => {
    setPage(e.page);
    setFirst(e.page * 2);
  };

  //filtrare
  const [filters, setFilters] = useState({
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    category: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const handleFilter = (e) => {
    const oldFilters = filters;
    oldFilters[e.field] = e.constraints.constraints[0];
    setFilters({ ...oldFilters });
  };

  const handleFilterClear = (e) => {
    setFilters({
      title: { value: null, matchMode: FilterMatchMode.CONTAINS },
      category: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
  };
  function back() {
    navigate("/");
  }

  return (
    <div>
      <div className="form">
        <Button className="btnBack" onClick={back}>
          BACK
        </Button>
        <h1 className="editMovie">EDIT MOVIE</h1>
        <InputText
          placeholder="Introduceti numele filmului"
          value={movie.title}
          onChange={(e) => set("title", e.target.value)}
        />
        <SelectButton
          value={movie.category}
          display="chip"
          options={categoriiSelectate}
          onChange={(e) => set("category", e.target.value)}
        />
        <Calendar
          placeholder="Introduceti data filmului"
          value={movie.publishDate}
          onChange={(e) => set("publishDate", e.target.value)}
        />
        <div>
          <Button onClick={saveMovie}>Salveaza</Button>
        </div>
        <div>
          <Button onClick={deleteMovie} className="p-button-danger">
            Sterge
          </Button>
        </div>
      </div>
      <div className="datatable">
        <DataTable
          value={filteredMovies}
          filter
          paginator
          rows={2}
          first={first}
          onPage={handlePageChange}
        >
          <Column
            header="Nume"
            field="name"
            filter
            filterField="name"
            filterPlaceholder="filter by name"
            onFilterApplyClick={handleFilter}
            onFilterClear={handleFilterClear}
          />
          <Column
            header="Rol"
            field="role"
            filter
            filterField="role"
            filterPlaceholder="filter by role"
            onFilterApplyClick={handleFilter}
            onFilterClear={handleFilterClear}
          />
          <Column
            body={(data, props) => (
              <Button
                className="p-button-danger"
                onClick={async () => {
                  if (data.id && data.id !== "new") {
                    const response = await fetch(
                      `/movies/${movie.id}/crewmembers/${data.id}`,
                      {
                        method: "DELETE",
                      }
                    );
                    if (response.status === 200) {
                      window.location.reload(false);
                    }
                  }
                }}
              >
                Sterge
              </Button>
            )}
          />
          <Column
            body={(data, props) => (
              <Button>
                <a href={`/movies/${mId}/crewmembers/${data.id}`}>Editeaza</a>
              </Button>
            )}
          />
        </DataTable>
        <Button className="newmember">
          <a href={`/movies/${mId}/crewmembers/new`} className="add">
            ADD MEMBER
          </a>
        </Button>
      </div>
    </div>
  );
}

export default MovieForm;
