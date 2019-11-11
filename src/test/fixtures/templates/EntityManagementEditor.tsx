import * as React from "react";
import { FormEvent } from "react";
import { Button, Card, Form, message } from "antd";
import { observer } from "mobx-react";
import { CarManagement } from "./CarManagement";
import { FormComponentProps } from "antd/lib/form";
import { Link, Redirect } from "react-router-dom";
import { IReactionDisposer, observable, reaction } from "mobx";
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps
} from "react-intl";

import {
  collection,
  FormItem,
  instance,
  withLocalizedForm
} from "@cuba-platform/react";

import "../../app/App.css";
import { Car } from "../../cuba/entities/scr$Car";

import { Garage } from "../../cuba/entities/scr$Garage";

type Props = FormComponentProps & EditorProps;

type EditorProps = {
  entityId: string;
};

@observer
class CarEditComponent extends React.Component<Props & WrappedComponentProps> {
  dataInstance = instance<Car>(Car.NAME, {
    view: "car-edit",
    loadImmediately: false
  });

  garagesDc = collection<Garage>(Garage.NAME, { view: "_minimal" });

  @observable
  updated = false;
  reactionDisposer: IReactionDisposer;

  fields = ["manufacturer", "model", "wheelOnRight", "garage"];

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
        message.warn(
          this.props.intl.formatMessage({
            id: "management.editor.validationError"
          })
        );
        return;
      }
      this.dataInstance
        .update(this.props.form.getFieldsValue(this.fields))
        .then(() => {
          message.success(
            this.props.intl.formatMessage({ id: "management.editor.success" })
          );
          this.updated = true;
        })
        .catch(() => {
          alert(
            this.props.intl.formatMessage({ id: "management.editor.error" })
          );
        });
    });
  };

  render() {
    if (this.updated) {
      return <Redirect to={CarManagement.PATH} />;
    }

    const { status } = this.dataInstance;

    return (
      <Card className="page-layout-narrow">
        <Form onSubmit={this.handleSubmit} layout="vertical">
          <FormItem
            entityName={Car.NAME}
            propertyName="manufacturer"
            form={this.props.form}
            rules={[{ required: true }]}
          />

          <FormItem
            entityName={Car.NAME}
            propertyName="model"
            form={this.props.form}
          />

          <FormItem
            entityName={Car.NAME}
            propertyName="wheelOnRight"
            form={this.props.form}
            valuePropName="checked"
          />

          <FormItem
            entityName={Car.NAME}
            propertyName="garage"
            form={this.props.form}
            optionsContainer={this.garagesDc}
          />

          <Form.Item style={{ textAlign: "center" }}>
            <Link to={CarManagement.PATH}>
              <Button htmlType="button">
                <FormattedMessage id="management.editor.cancel" />
              </Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              disabled={status !== "DONE" && status !== "ERROR"}
              loading={status === "LOADING"}
              style={{ marginLeft: "8px" }}
            >
              <FormattedMessage id="management.editor.submit" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }

  componentDidMount() {
    if (this.props.entityId !== CarManagement.NEW_SUBPATH) {
      this.dataInstance.load(this.props.entityId);
    } else {
      this.dataInstance.setItem(new Car());
    }
    this.reactionDisposer = reaction(
      () => {
        return this.dataInstance.item;
      },
      () => {
        this.props.form.setFieldsValue(
          this.dataInstance.getFieldValues(this.fields)
        );
      }
    );
  }

  componentWillUnmount() {
    this.reactionDisposer();
  }
}

export default injectIntl(withLocalizedForm<EditorProps>(CarEditComponent));
