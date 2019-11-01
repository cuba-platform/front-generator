import * as React from "react";<% if (listType === 'table') { %>
import {observable} from 'mobx';<% } %>
import {observer} from "mobx-react";
import {
  Modal, Button,<% if (listType === 'cards') { %>
  Card, Icon, Spin,<% } else if (listType === 'list') { %>
  List, Icon, Spin,<% } %>
} from "antd";
import {<%=entity.className%>} from "<%= relDirShift %><%=entity.path%>";
import {Link} from "react-router-dom";
import {
  collection, injectMainStore, MainStoreInjected,<% if (listType === 'table') { %>
  DataTable,<% } else { %>
  EntityProperty,<% } %>
} from "@cuba-platform/react";
import {SerializedEntity} from "@cuba-platform/rest";
import {<%=className%>} from "./<%=className%>";
import {FormattedMessage, injectIntl, WrappedComponentProps} from 'react-intl';

@injectMainStore
@observer
class <%=listComponentName%>Component extends React.Component<MainStoreInjected & WrappedComponentProps> {

  dataCollection = collection<<%=entity.className%>>(<%=entity.className%>.NAME, {view: '<%=listView.name%>', sort: '-updateTs'});
  fields = [<%listView.allProperties.forEach(p => {%>'<%=p.name%>',<%})%>];
<% if (listType === 'table') { %>
  @observable selectedRowId: string | undefined;
<% } %>
  showDeletionDialog = (e: SerializedEntity<<%=entity.className%>>) => {
    Modal.confirm({
      title: this.props.intl.formatMessage(
        {id: 'management.browser.delete.areYouSure'},
        {instanceName: e._instanceName}
      ),
      okText: this.props.intl.formatMessage({id: 'management.browser.delete.ok'}),
      cancelText: this.props.intl.formatMessage({id:'management.browser.delete.cancel'}),
      onOk: () => {<% if (listType === 'table') { %>
        this.selectedRowId = undefined;<% } %>
        return this.dataCollection.delete(e);
      }
    });
  };
<% if (listType === 'table') { %>
  render() {
    const buttons = (
      [
        (<Link to={<%=className%>.PATH + '/' + <%=className%>.NEW_SUBPATH} key='create'>
          <Button htmlType='button'
                  style={{margin: '0 12px 12px 0'}}
                  type='primary'
                  icon='plus'>
            <span><FormattedMessage id='management.browser.create'/></span>
          </Button>
        </Link>),
        (<Link to={<%=className%>.PATH + '/' + this.selectedRowId} key='edit'>
          <Button htmlType='button'
                  style={{margin: '0 12px 12px 0'}}
                  disabled={!this.selectedRowId}
                  type='default'>
            <FormattedMessage id='management.browser.edit'/>
          </Button>
        </Link>),
        (<Button htmlType='button'
                 style={{margin: '0 12px 12px 0'}}
                 disabled={!this.selectedRowId}
                 onClick={this.deleteSelectedRow}
                 key='remove'
                 type='default'>
          <FormattedMessage id='management.browser.remove'/>
        </Button>),
      ]
    );

    return (
      <DataTable dataCollection={this.dataCollection}
                 fields={this.fields}
                 onSelectedRowChange={this.onSelectedRowChange}
                 buttons={buttons}
                 defaultSort={'-updateTs'}
      />
    );
  }

  getRecordById(id: string): SerializedEntity<<%=entity.className%>> {
    const record: SerializedEntity<<%=entity.className%>> | undefined =
      this.dataCollection.items.find(record => record.id === id);

    if (!record) {
      throw new Error('Cannot find entity with id ' + id);
    }

    return record;
  }

  onSelectedRowChange = (selectedRowId: string) => {
    this.selectedRowId = selectedRowId;
  };

  deleteSelectedRow = () => {
    this.showDeletionDialog(this.getRecordById(this.selectedRowId!));
  };  
<% } else { %>
  render() {
    const {
      status,
      items
    } = this.dataCollection;

    if (status === "LOADING") {
      return (<div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
        <Spin size='large'/>
      </div>);
    }

    return (
      <div <% if (listType !== 'table') {%>className='page-layout-narrow'<%}%>>
        <div style={{marginBottom: '12px'}}>
          <Link to={<%=className%>.PATH + '/' + <%=className%>.NEW_SUBPATH}>
            <Button htmlType='button'
                    type='primary'
                    icon='plus'>
              <span><FormattedMessage id='management.browser.create'/></span>
            </Button>
          </Link>
        </div>
        <% if (listType === 'list') { %>
         <List itemLayout="horizontal"
            bordered
            dataSource={items}
            renderItem={item =>
              <List.Item actions={[
                  <Icon type='delete'
                        key='delete'
                        onClick={() => this.showDeletionDialog(item)}/>,
                  <Link to={<%=className%>.PATH + '/' + item.id} key='edit'>
                    <Icon type='edit'/>
                  </Link>
              ]}>
                <div style={{flexGrow: 1}}>
                {this.fields.map(p =>
                  <EntityProperty entityName={<%=entity.className%>.NAME}
                                  propertyName={p}
                                  value={item[p]}
                                  key={p}/>
                )}
                </div>
              </List.Item>
            }/>
        <% } else { %>
        {items == null || items.length === 0 ?
          <p><FormattedMessage id='management.browser.noItems'/></p> : null}
        {items.map(e =>
          <Card title={e._instanceName}
                key={e.id}
                style={{marginBottom: '12px'}}
                actions={[
                  <Icon type='delete'
                        key='delete'
                        onClick={() => this.showDeletionDialog(e)}/>,
                  <Link to={<%=className%>.PATH + '/' + e.id} key='edit'>
                    <Icon type='edit'/>
                  </Link>
                ]}>
                {this.fields.map(p =>
                  <EntityProperty entityName={<%=entity.className%>.NAME}
                                  propertyName={p}
                                  value={e[p]}
                                  key={p}/>
                )}
          </Card>
        )}
        <% } %>
      </div>
    )
  }
<% } %>
}

const <%=listComponentName%> = injectIntl(<%=listComponentName%>Component);

export default <%=listComponentName%>;
