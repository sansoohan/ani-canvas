import styled from 'styled-components';

export const StyledGallery = styled.div`
  .pagination {
    margin: auto;

    .active {
      font-weight: bold;
      color: rgb(63,128,182);
    }

    li {
      display: inline-block;
      margin: 4px;
      font-size: 20px;
    }
  }
`;
