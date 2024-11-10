import React, { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { getPage } from './utils';
import Landing from './landing/Landing'; // Make sure to import your Landing component
import CEO from './ceo/CEO';

const Root = () => {
  const [page, setPage] = useState(null);
  useEffect(() => {
    const fetchPage = async () => {
      const pageValue = await getPage();
      setPage(pageValue);
    };

    fetchPage();
  }, []);

  if (page === null) {
    return <div>Loading...</div>; // Optionally, you can show a loading state while fetching
  }

  return (
    <>
      {page === 'landing' && <Landing />}
      {page === 'ceo' && (
        <>
          <CEO />
          </>
      )}
      
    </>
  );
};

export default Root;
