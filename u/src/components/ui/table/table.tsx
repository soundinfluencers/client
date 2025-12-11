import React from "react";
import "./_table.scss";
interface Props {}

// reusable table //

// table_header and table__body-row we use for adding data and fill like that  //
/**
   <div className="table__header || table__body-row">
        {data.map((headerData || bodyData, i) => (
           <div key={i} className="table__header-data || table__body-data">
              {headerData || bodyData}
           </div>
        ))}
   </div> as example 

 */

export const Table: React.FC<Props> = () => {
  return (
    <div className="table">
      <div className="table__header">
        <div className="table__header-data">Networks</div>
        <div className="table__header-data">Followers</div>
        <div className="table__header-data">Req. date</div>
        <div className="table__header-data">Content</div>
        <div className="table__header-data">Post description</div>
        <div className="table__header-data">Story tag</div>
        <div className="table__header-data">Story link</div>
        <div className="table__header-data">Additional brief</div>
      </div>
      <div className="table__body-row">
        <div className="table__body-data">Dance music BPM</div>
        <div className="table__body-data">12000000</div>
        <div className="table__body-data">ASAP</div>
        <div className="table__body-data">VIDEO</div>
        <div className="table__body-data">Post description</div>{" "}
        <div className="table__body-data">@kolschofficia </div>
        <div className="table__body-data">https://ffm.to/joan</div>
        <div className="table__body-data">special requests text</div>
      </div>{" "}
      <div className="table__body-row">
        <div className="table__body-data">Dance music BPM</div>
        <div className="table__body-data">12000000</div>
        <div className="table__body-data">ASAP</div>
        <div className="table__body-data">VIDEO</div>
        <div className="table__body-data">Post description</div>{" "}
        <div className="table__body-data">@kolschofficia </div>
        <div className="table__body-data">https://ffm.to/joan</div>
        <div className="table__body-data">special requests text</div>
      </div>
      <div className="table__add">
        <button>Add influencer</button>
      </div>{" "}
      <div className="table__footer">
        <div className="table__footer-data">Price: 1599€</div>
      </div>
    </div>
  );
};
