import * as React from "react";
import { observer } from "mobx-react";
import { Modal, Button, Card, Icon, Spin } from "antd";
import { Car } from "cuba/entities/mpg$Car";
import { Link } from "react-router-dom";
import { collection, EntityProperty } from "@cuba-platform/react";
import { SerializedEntity } from "@cuba-platform/rest";
import { CarManagement } from "./CarManagement";

@observer
export class CarCards extends React.Component {
  dataCollection = collection<Car>(Car.NAME, {
    view: "car-edit",
    sort: "-updateTs"
  });
  fields = [
    "manufacturer",
    "model",
    "regNumber",
    "purchaseDate",
    "manufactureDate",
    "wheelOnRight",
    "carType",
    "ecoRank",
    "maxPassengers",
    "price",
    "mileage",
    "garage",
    "technicalCertificate",
    "photo"
  ];

  showDeletionDialog = (e: SerializedEntity<Car>) => {
    Modal.confirm({
      title: `Are you sure you want to delete ${e._instanceName}?`,
      okText: "Delete",
      cancelText: "Cancel",
      onOk: () => {
        return this.dataCollection.delete(e);
      }
    });
  };

  render() {
    const { status, items } = this.dataCollection;

    if (status === "LOADING") {
      return (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
          }}
        >
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="page-layout-narrow">
        <div style={{ marginBottom: "12px" }}>
          <Link to={CarManagement.PATH + "/" + CarManagement.NEW_SUBPATH}>
            <Button htmlType="button" type="primary" icon="plus">
              Create
            </Button>
          </Link>
        </div>

        {items == null || items.length === 0 ? <p>No data</p> : null}
        {items.map(e => (
          <Card
            title={e._instanceName}
            key={e.id}
            style={{ marginBottom: "12px" }}
            actions={[
              <Icon
                type="delete"
                key="delete"
                onClick={() => this.showDeletionDialog(e)}
              />,
              <Link to={CarManagement.PATH + "/" + e.id} key="edit">
                <Icon type="edit" />
              </Link>
            ]}
          >
            {this.fields.map(p => (
              <EntityProperty
                entityName={Car.NAME}
                propertyName={p}
                value={e[p]}
                key={p}
              />
            ))}
          </Card>
        ))}
      </div>
    );
  }
}
