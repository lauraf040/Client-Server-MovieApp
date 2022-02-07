import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React from "react";
import { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(0);
  const [first, setFirst] = useState(0);

  const loadMovies = async () => {
    const responseMovies = await fetch("/movies");
    if (responseMovies.status === 200) {
      setMovies(await responseMovies.json());
    }
  };
  useEffect(() => loadMovies(), []);

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

  return (
    <div>
      <div className="datatableHome">
        <h1>Movie management</h1>
        <DataTable
          className="datatable"
          value={movies}
          paginator
          rows={2}
          first={first}
          onPage={handlePageChange}
        >
          <Column
            header="Titlu"
            field="title"
            filter
            filterField="title"
            filterPlaceholder="filter by title"
            onFilterApplyClick={handleFilter}
            onFilterClear={handleFilterClear}
            sortable
          />
          <Column
            header="Categorie"
            field="category"
            filter
            filterField="category"
            filterPlaceholder="filter by category"
            onFilterApplyClick={handleFilter}
            onFilterClear={handleFilterClear}
          />

          <Column header="Data" field="publishDate"></Column>
          <Column
            body={(data, props) => (
              <Button>
                <a href={`/movies/${data.id}/crewmembers`}>SEE MEMBERS</a>
              </Button>
            )}
          ></Column>
        </DataTable>
        <Button className="newmovie">
          <a href={`/movies/new/crewmembers`}>ADD NEW MOVIE</a>
        </Button>
      </div>
    </div>
  );
}
export default HomePage;
