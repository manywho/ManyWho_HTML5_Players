/*!

Copyright 2013 Manywho, Inc.

Licensed under the Manywho License, Version 1.0 (the "License"); you may not use this
file except in compliance with the License.

You may obtain a copy of the License at: http://manywho.com/sharedsource

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied. See the License for the specific language governing
permissions and limitations under the License.

*/

(function ($) {

    var editor = null;

    // This method contains all of the stuff that's particular to the map element implementations
    //
    var setupMapElements = function (graph, developerMode) {
        // Configure the sidebar button for the map elements
        configureSidebarMapElement.call(this, graph, 'user', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_STEP.toLowerCase(), 'Step', 'icon-map-marker', 'flow-button', developerMode);
        configureSidebarMapElement.call(this, graph, 'user', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_INPUT.toLowerCase(), 'Page', 'icon-th', 'flow-button', developerMode);
        //configureSidebarMapElement.call(this, graph, 'user', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase(), 'Remote Page', 'icon-globe', 'flow-button', developerMode);
        configureSidebarMapElement.call(this, graph, 'logic', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DECISION.toLowerCase(), 'Decision', 'icon-ok-sign', 'flow-button', developerMode);
        configureSidebarMapElement.call(this, graph, 'logic', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_OPERATOR.toLowerCase(), 'Operator', 'icon-cog', 'flow-button', developerMode);
        configureSidebarMapElement.call(this, graph, 'logic', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_MESSAGE.toLowerCase(), 'Message', 'icon-time', 'flow-button', developerMode);
        configureSidebarMapElement.call(this, graph, 'data', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_LOAD.toLowerCase(), 'Load', 'icon-circle-arrow-up', 'flow-button', developerMode);
        configureSidebarMapElement.call(this, graph, 'data', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_SAVE.toLowerCase(), 'Save', 'icon-circle-arrow-down', 'flow-button', developerMode);
        //configureSidebarMapElement.call(this, graph, 'data', ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_DELETE.toLowerCase(), 'Delete', 'icon-remove-sign', 'flow-button', developerMode);
    }

    // This method contains all of the stuff that's particular to the group element implementations
    //
    var setupGroupElements = function (graph, developerMode) {
        // Configure the sidebar button for the group elements
        configureSidebarGroupElement.call(this, graph, 'group', ManyWhoConstants.GROUP_ELEMENT_TYPE_IMPLEMENTATION_SWIMLANE.toLowerCase(), 'Swimlane', 'icon-user', 'flow-button', developerMode);
    }

    // Implementation specific method to open the dialog page for map elements.
    //
    var showMapElementDialog = function (graphId, operation, locationX, locationY, elementType, elementId, groupElementId) {
        editing(true);

        // We don't yet have the flows for these map element types so need to show the developer tooling
        if (ManyWhoSharedServices.getDeveloperMode() == true ||
            /*elementType.toLowerCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_OPERATOR.toLowerCase() ||
            elementType.toLowerCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_MESSAGE.toLowerCase() ||
            elementType.toLowerCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_LOAD.toLowerCase() ||
            elementType.toLowerCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DECISION.toLowerCase() ||*/
            elementType.toLowerCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_DELETE.toLowerCase() ||
            elementType.toLowerCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE.toLowerCase()) {
            // Load the developer editor for the element
            ManyWhoSharedServices.showGraphElementDeveloperDialog(elementType,
                                                                  elementId,
                                                                  groupElementId,
                                                                  graphId,
                                                                  operation,
                                                                  locationX,
                                                                  locationY,
                                                                  function (json, successCallback) {
                                                                      // Save the map element back to the service
                                                                      ManyWhoDeveloper.saveMapElement(
                                                                          json,
                                                                          function (data, status, xhr) {
                                                                              // Tell the caller that the user decided to save
                                                                              updateMapElement(graphId, data.id, elementType, data.developerName);

                                                                              // Give the data back to the caller
                                                                              successCallback.call(this, JSON.stringify(data, undefined, 4));
                                                                          },
                                                                          function () {
                                                                              alert('Whoops! Something bad happened - check the console logs in the browser for details');
                                                                          });
                                                                  },
                                                                  function (graphId, elementId) {
                                                                      // Delete the map element from the service
                                                                      ManyWhoDeveloper.deleteMapElement(
                                                                          elementId,
                                                                          function (data, status, xhr) {
                                                                              // Send back a cancel and a "delete"
                                                                              cancelMapElement(graphId, true);
                                                                              editing(false);
                                                                          },
                                                                          function () {
                                                                              alert('Whoops! Something bad happened - check the console logs in the browser for details');
                                                                          });
                                                                  },
                                                                  function (graphId, operation, flowOutcome) {
                                                                      cancelMapElement(graphId, operation, flowOutcome);
                                                                  });
        } else {
            // Load the flow for the appropriate element type
            ManyWhoSharedServices.showMapElementConfigDialog(elementType,
                                                             elementId,
                                                             groupElementId,
                                                             graphId,
                                                             operation,
                                                             locationX,
                                                             locationY,
                                                             function (elementType, elementId, graphId, developerName, flowOutcome) {
                                                                 if (flowOutcome != null &&
                                                                     flowOutcome.toLowerCase() == 'delete') {
                                                                     deleteMapElement(graphId);
                                                                 } else {
                                                                     updateMapElement(graphId, elementId, elementType, developerName);
                                                                 }
                                                                 editing(false);
                                                             },
                                                             function (graphId, operation, flowOutcome) {
                                                                 cancelMapElement(graphId, operation, flowOutcome);
                                                             });
        }
    }

    // Implementation specific method to open the dialog page for group elements.
    //
    var showGroupElementDialog = function (graphId, operation, locationX, locationY, height, width, elementType, elementId) {
        editing(true);

        // We want to run the designer in developer mode - so show the developer dialog
        if (ManyWhoSharedServices.getDeveloperMode() == true) {
            // Load the developer editor for the element
            ManyWhoSharedServices.showGraphElementDeveloperDialog(elementType,
                                                                  elementId,
                                                                  null,
                                                                  graphId,
                                                                  operation,
                                                                  locationX,
                                                                  locationY,
                                                                  function (json, successCallback) {
                                                                      // Save the group element back to the service
                                                                      ManyWhoDeveloper.saveGroupElement(
                                                                          json,
                                                                          function (data, status, xhr) {
                                                                              // Tell the caller that the user decided to save
                                                                              updateGroupElement(graphId, data.id, elementType, data.developerName);

                                                                              // Give the data back to the caller
                                                                              successCallback.call(this, JSON.stringify(data, undefined, 4));
                                                                          },
                                                                          function () {
                                                                              alert('Whoops! Something bad happened - check the console logs in the browser for details');
                                                                          });
                                                                  },
                                                                  function (graphId, elementId) {
                                                                      // Delete the group element from the service
                                                                      ManyWhoDeveloper.deleteGroupElement(
                                                                          elementId,
                                                                          function (data, status, xhr) {
                                                                              // Send back a cancel and a "delete"
                                                                              cancelGroupElement(graphId, true);
                                                                              editing(false);
                                                                          },
                                                                          function () {
                                                                              alert('Whoops! Something bad happened - check the console logs in the browser for details');
                                                                          });
                                                                  },
                                                                  function (graphId, doDelete) {
                                                                      cancelGroupElement(graphId, doDelete);
                                                                      editing(false);
                                                                  });
        } else {
            // Load the dialog for the swimlane
            ManyWhoSharedServices.showGroupElementConfigDialog(elementType,
                                                               elementId,
                                                               graphId,
                                                               operation,
                                                               locationX,
                                                               locationY,
                                                               height,
                                                               width,
                                                               function (elementType, elementId, graphId, developerName, flowOutcome) {
                                                                   if (flowOutcome != null &&
                                                                       flowOutcome.toLowerCase() == 'delete') {
                                                                       deleteGroupElement(graphId);
                                                                   } else {
                                                                       updateGroupElement(graphId, elementId, elementType, developerName);
                                                                   }
                                                                   editing(false);
                                                               },
                                                               function (graphId, doDelete) {
                                                                   cancelGroupElement(graphId, doDelete);
                                                                   editing(false);
                                                               });
        }
    }

    var clearGraph = function () {
        var graph = editor.graph;
        var model = graph.getModel();

        // Clear everything in the graph
        model.clear();

        // Reset any undo history
        editor.resetHistory();

        ManyWhoSharedServices.setEditingToken('');
        ManyWhoSharedServices.setFlowId('');

        $('#flow-developer-name').html('');
        $('#flow-developer-summary').html('');
        $('#flow-allow-jumping').html('');
        $('#flow-start-map-element-id').val('');
    }

    var loadFlowSuccess = function (loadFlowSuccessCallback) {
        return function (data, status, xhr) {
            // Clear the graph
            clearGraph.call(this);

            // Assign the standard values
            $('#flow-developer-name').html(data.developerName);
            $('#flow-developer-summary').html(data.developerSummary);
            $('#flow-start-map-element-id').val(data.startMapElementId);

            // Assign the global values
            ManyWhoSharedServices.setEditingToken(data.editingToken);
            ManyWhoSharedServices.setFlowId(data.id.id);

            // Now that we have the new flow, sync the graph
            ManyWhoFlow.syncGraph('ManyWhoFlow.LoadFlowSuccess',
                                  data.editingToken,
                                  data.id.id,
                                  data.developerName,
                                  data.developerSummary,
                                  data.startMapElementId,
                                  null,
                                  ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                  null,
                                  applyElementsToGraph(loadFlowSuccessCallback),
                                  null);
        };
    }

    // Create the outcome to connect the two cells.
    //
    var createOutcome = function (outcomeId, mapElementId, nextMapElementId, developerName, useTransaction) {
        var graph = editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var cell = null;

        if (useTransaction == true) {
            model.beginUpdate();
        }
        try {
            var source = getMapElementCellFromGraph.call(this, mapElementId);
            var target = getMapElementCellFromGraph.call(this, nextMapElementId);

            var doc = mxUtils.createXmlDocument();
            var node = doc.createElement('OutcomeNode');

            node.setAttribute('label', developerName);
            node.setAttribute('outcomeId', outcomeId);
            node.setAttribute('nodeType', 'outcome');

            graph.insertEdge(parent, null, node, source, target, null);
        }
        finally {
            if (useTransaction == true) {
                model.endUpdate();
            }
        }
    }

    var getChildMapElementCells = function (graph, parent, allCells) {
        var cleanCells = new Array();
        var cells = graph.getChildCells(parent, allCells, allCells);

        if (cells != null) {
            var count = 0;

            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];

                if (cell.getValue() != null &&
                    'getAttribute' in cell.getValue()) {
                    var elementId = cell.getValue().getAttribute('elementId');
                    var nodeType = cell.getValue().getAttribute('nodeType');

                    // If we have a group, we need to do a recursion on the cells
                    if (nodeType == 'group') {
                        var childCleanCells = getChildMapElementCells(graph, cell, false);

                        if (childCleanCells != null &&
                            childCleanCells.length > 0) {
                            for (var j = 0; j < childCleanCells.length; j++) {
                                cleanCells[count] = childCleanCells[j];
                                count++;
                            }
                        }
                    } else if (elementId != null &&
                               elementId != '' &&
                               nodeType == 'map') {
                        cleanCells[count] = cell;
                        count++;
                    }
                }
            }
        }

        return cleanCells;
    }

    var getChildGroupElementCells = function (graph, parent) {
        var cleanCells = new Array();
        var cells = graph.getChildCells(parent, false, false);

        if (cells != null) {
            var count = 0;

            for (var i = 0; i < cells.length; i++) {
                var cell = cells[i];

                if (cell.getValue() != null &&
                    'getAttribute' in cell.getValue()) {
                    var elementId = cell.getValue().getAttribute('elementId');
                    var nodeType = cell.getValue().getAttribute('nodeType');

                    // If we have a group, we need to do a recursion on the cells just in case the group contains a group
                    if (nodeType == 'group') {
                        var childCleanCells = getChildGroupElementCells(graph, cell);

                        if (childCleanCells != null &&
                            childCleanCells.length > 0) {
                            for (var j = 0; j < childCleanCells.length; j++) {
                                cleanCells[count] = childCleanCells[j];
                                count++;
                            }
                        }
                    }

                    if (elementId != null &&
                        elementId != '' &&
                        nodeType == 'group') {
                        cleanCells[count] = cell;
                        count++;
                    }
                }
            }
        }

        return cleanCells;
    }

    // This method is used to get the list of map element coordinate objects from the graph so we can update the flow or synchronize changes.
    //
    var getMapElementsFromGraph = function () {
        var graph = editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var cleanCells = null;
        var mapElements = new Array();

        // This is a recursive method to make sure we collect all of the cells from all of the groups
        cleanCells = getChildMapElementCells(graph, parent, false);

        if (cleanCells != null) {
            var count = 0;
            var adjusted = cleanCells.length - 1;

            for (var i = 0; i < cleanCells.length; i++) {
                var cleanCell = cleanCells[i];
                var groupElementId = null;

                parent = graph.getModel().getParent(cleanCell);

                // We have a group cell
                if (parent != null &&
                    parent.getValue() != null &&
                    'getAttribute' in parent.getValue()) {
                    groupElementId = parent.getValue().getAttribute('elementId');
                }

                var mapElement = createMapElementFromCell.call(this, parent, groupElementId, cleanCell);

                if (mapElement != null) {
                    mapElements[count] = mapElement;
                    count++;
                }
            }
        }

        return mapElements;
    }

    // This method is used to get the list of group element coordinate objects from the graph so we can update the flow or synchronize changes.
    //
    var getGroupElementsFromGraph = function () {
        var graph = editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var cleanCells = null;
        var groupElements = new Array();

        // This is a recursive method to make sure we collect all of the cells from all of the groups
        cleanCells = getChildGroupElementCells(graph, parent);

        if (cleanCells != null) {
            var count = 0;
            var adjusted = cleanCells.length - 1;

            for (var i = 0; i < cleanCells.length; i++) {
                var cleanCell = cleanCells[i];
                var groupElement = createGroupElementFromCell.call(this, cleanCell);

                if (groupElement != null) {
                    groupElements[count] = groupElement;
                    count++;
                }
            }
        }

        return groupElements;
    }

    var createMapElementFromCell = function (parent, groupElementId, cell) {
        var mapElement = null;

        var x = cell.getGeometry().getPoint().x;
        var y = cell.getGeometry().getPoint().y;

        if (cell.getValue() != null &&
            'getAttribute' in cell.getValue()) {
            var elementId = cell.getValue().getAttribute('elementId');
            var elementType = cell.getValue().getAttribute('elementType');
            var nodeType = cell.getValue().getAttribute('nodeType');

            if (elementId != null &&
                elementId != '' &&
                nodeType != null &&
                nodeType == 'map') {
                mapElement = { 'id': elementId, 'elementType': elementType, 'groupElementId': groupElementId, 'x': x, 'y': y };
            }
        }

        return mapElement;
    }

    var createGroupElementFromCell = function (cell) {
        var groupElement = null;
        var x = cell.getGeometry().getPoint().x;
        var y = cell.getGeometry().getPoint().y;
        var width = cell.getGeometry().width;
        var height = cell.getGeometry().height;

        if (cell.getValue() != null &&
            'getAttribute' in cell.getValue()) {
            var elementId = cell.getValue().getAttribute('elementId');
            var elementType = cell.getValue().getAttribute('elementType');
            var nodeType = cell.getValue().getAttribute('nodeType');

            if (elementId != null &&
                elementId != '' &&
                nodeType != null &&
                nodeType == 'group') {
                groupElement = { 'id': elementId, 'elementType': elementType, 'x': x, 'y': y, 'height': height, 'width': width };
            }
        }

        return groupElement;
    }

    var applyElementsToGraph = function (syncSuccessCallback) {
        return function (data, status, xhr) {
            var graph = editor.graph;
            var model = graph.getModel();
            var parent = graph.getDefaultParent();
            var mapElementCells;
            var groupElementCells;

            // Get the map and group element cells from the graph
            mapElementCells = getChildMapElementCells(graph, parent, false);
            groupElementCells = getChildGroupElementCells(graph, parent);

            model.beginUpdate();
            try {
                // This portion deals with adding the groups - that's the first thing we need to do
                // TODO: At the moment, we are assuming a group cannot contain a group - just this code below
                // We need to come up with an algorithm to make sure the build order is OK
                if (data.groupElements != null &&
                    data.groupElements.length > 0) {
                    for (var i = 0; i < data.groupElements.length; i++) {
                        var groupElement = data.groupElements[i];
                        var groupElementCell = null;

                        // Search for the cell in the list
                        if (groupElementCells != null) {
                            for (var j = 0; j < groupElementCells.length; j++) {
                                cell = groupElementCells[j];

                                var cellElementId = cell.getValue().getAttribute('elementId');

                                if (cellElementId == groupElement.id) {
                                    groupElementCell = cell;
                                    break;
                                }
                            }
                        }

                        // Check to see if we found a cell on our graph
                        if (groupElementCell != null) {
                            var translateX = groupElement.x - groupElementCell.getGeometry().getPoint().x;
                            var translateY = groupElement.y - groupElementCell.getGeometry().getPoint().y;

                            if (translateX != 0 ||
                                translateY != 0) {
                                // Move the group element cell to the new position
                                graph.translateCell(groupElementCell, translateX, translateY);
                            }

                            // Resize the cell - this may also do the translation - not sure
                            graph.resizeCell(groupElementCell, new mxRectangle(groupElement.x, groupElement.y, groupElement.width, groupElement.height));

                            groupElementCell.getValue().setAttribute('label', groupElement.developerName);
                            groupElementCell.getValue().setAttribute('elementId', groupElement.id);
                            groupElementCell.getValue().setAttribute('elementType', groupElement.elementType);
                            groupElementCell.getValue().setAttribute('nodeType', 'group');
                        } else {
                            // Create a new group element
                            createGroupElement(groupElement.x, groupElement.y, groupElement.height, groupElement.width, groupElement.id, groupElement.elementType, groupElement.developerName, false);
                        }
                    }
                }

                // This portion deals with the cells - not the outcomes just yet as we need the cells first
                if (data.mapElements != null &&
                    data.mapElements.length > 0) {
                    for (var i = 0; i < data.mapElements.length; i++) {
                        var mapElement = data.mapElements[i];
                        var mapElementCell = null;

                        // Search for the cell in the list
                        if (mapElementCells != null) {
                            for (var j = 0; j < mapElementCells.length; j++) {
                                cell = mapElementCells[j];

                                var cellElementId = cell.getValue().getAttribute('elementId');

                                if (cellElementId == mapElement.id) {
                                    mapElementCell = cell;
                                    break;
                                }
                            }
                        }

                        // Check to see if we found a cell on our graph
                        if (mapElementCell != null) {
                            var translateX = mapElement.x - mapElementCell.getGeometry().getPoint().x;
                            var translateY = mapElement.y - mapElementCell.getGeometry().getPoint().y;

                            if (translateX != 0 ||
                                translateY != 0) {
                                // Move the map element cell to the new position
                                graph.translateCell(mapElementCell, translateX, translateY);
                            }

                            // Make sure we apply the label correctly
                            if (mapElement.elementType.toUpperCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_START == true) {
                                cell.getValue().setAttribute('label', '<strong>' + mapElement.developerName + '</strong>');
                            } else {
                                cell.getValue().setAttribute('label', '<div style="margin-left: 35px; margin-right: 3px; color: #ffffff;">' + mapElement.developerName + '</div>');
                            }

                            mapElementCell.getValue().setAttribute('elementId', mapElement.id);
                            mapElementCell.getValue().setAttribute('elementType', mapElement.elementType);
                            mapElementCell.getValue().setAttribute('nodeType', 'map');
                        } else {
                            // We're going to change parenting, so we first assume the parent is the global parent cell
                            var localParent = parent;

                            if (mapElement.groupElementId != null &&
                                mapElement.groupElementId.trim().length > 0) {
                                var groupCell = getGroupElementCellFromGraph(mapElement.groupElementId);

                                if (groupCell != null) {
                                    // We've found the group - make this the parent for the cell creation call
                                    localParent = groupCell;
                                }
                            }

                            // Create a new map element
                            createMapElement(localParent, mapElement.x, mapElement.y, mapElement.id, mapElement.elementType, mapElement.developerName, false);
                        }
                    }
                }
            }
            finally {
                model.endUpdate();
            }

            model.beginUpdate();
            try {
                // Get the graph cells again as we've added some
                mapElementCells = getChildMapElementCells(graph, parent, true);
                groupElementCells = getChildGroupElementCells(graph, parent);

                // Now we deal with the cells that have been deleted and verify the outcome connectors
                // This time we start with the graph as the priority iteration
                if (groupElementCells != null) {
                    for (var i = 0; i < groupElementCells.length; i++) {
                        cell = groupElementCells[i];

                        var found = false;
                        var cellElementId = cell.getValue().getAttribute('elementId');
                        var cellNodeType = cell.getValue().getAttribute('nodeType');

                        if (data.groupElements != null &&
                            data.groupElements.length > 0) {
                            for (var j = 0; j < data.groupElements.length; j++) {
                                var groupElement = data.groupElements[j];

                                // We still have the cell
                                if (groupElement.id == cellElementId) {
                                    found = true;
                                    break;
                                }
                            }
                        }

                        // The cell was not found, remove it from the graph
                        if (found == false) {
                            deleteCellsFromGraph(graph, [cell]);
                        }
                    }
                }

                if (mapElementCells != null) {
                    for (var i = 0; i < mapElementCells.length; i++) {
                        cell = mapElementCells[i];

                        // We have an edge rather than a full cell
                        if (cell.getValue() == null ||
                            'getAttribute' in cell.getValue() == false) {
                            //alert('edge found');
                            continue;
                        }

                        var found = false;
                        var cellElementId = cell.getValue().getAttribute('elementId');
                        var cellNodeType = cell.getValue().getAttribute('nodeType');

                        if (data.mapElements != null &&
                            data.mapElements.length > 0) {
                            for (var j = 0; j < data.mapElements.length; j++) {
                                var mapElement = data.mapElements[j];

                                // We still have the cell - we now check we have all the connectors
                                if (mapElement.id == cellElementId) {
                                    found = true;
                                    var cellsToDelete = new Array();

                                    if (mapElement.outcomes != null &&
                                        mapElement.outcomes.length > 0) {
                                        // Go through and add any missing outcomes to the graph
                                        for (var k = 0; k < mapElement.outcomes.length; k++) {
                                            var outcome = mapElement.outcomes[k];

                                            if (outcome.nextMapElementId != null &&
                                                outcome.nextMapElementId.trim().length > 0) {
                                                var addOutcome = true;

                                                // Check to see if an outcome already exists on the map for this outcome object
                                                if (cell.edges != null &&
                                                    cell.edges.length > 0) {
                                                    for (var l = 0; l < cell.edges.length; l++) {
                                                        var edgeCell = cell.edges[l];

                                                        if (edgeCell.getValue().getAttribute('outcomeId') == outcome.id) {
                                                            addOutcome = false;
                                                            break;
                                                        }
                                                    }
                                                }

                                                if (addOutcome == true) {
                                                    createOutcome(outcome.id, mapElement.id, outcome.nextMapElementId, outcome.developerName, false);
                                                }
                                            }
                                        }

                                        // Go through and remove any that are no longer relevant
                                        if (cell.edges != null &&
                                            cell.edges.length > 0) {
                                            for (var l = 0; l < cell.edges.length; l++) {
                                                var edgeCell = cell.edges[l];
                                                var found = false;

                                                // Check to make sure this edge is going out from the map element (i.e. it's a child)
                                                if (edgeCell.source.getValue().getAttribute('elementId') == mapElement.id) {
                                                    for (var k = 0; k < mapElement.outcomes.length; k++) {
                                                        if (edgeCell.getValue().getAttribute('outcomeId') == mapElement.outcomes[k].id) {
                                                            found = true;
                                                            break;
                                                        }
                                                    }
                                                } else {
                                                    found = true;
                                                }

                                                if (found == false) {
                                                    // Add this edge to the list to be deleted
                                                    cellsToDelete[cellsToDelete.length] = edgeCell;
                                                }
                                            }

                                            // We don't have any outcomes, we we should delete any that we have on the graph
                                            if (cellsToDelete != null &&
                                                cellsToDelete.length > 0) {
                                                for (var m = 0; m < cellsToDelete.length; m++) {
                                                    deleteMapElementOutcome(cellsToDelete[m].id);
                                                }
                                            }
                                        }
                                    } else {
                                        // We don't have any outcomes, we we should delete any that we have on the graph
                                        if (cell.edges != null &&
                                            cell.edges.length > 0) {
                                            for (var m = 0; m < cell.edges.length; m++) {
                                                var edgeCell = cell.edges[m];
                                                var doDelete = false;

                                                // Check to make sure this edge is going out from the map element (i.e. it's a child)
                                                if (edgeCell.source.getValue().getAttribute('elementId') == mapElement.id) {
                                                    // Add this edge to the list to be deleted
                                                    cellsToDelete[cellsToDelete.length] = edgeCell;
                                                }
                                            }

                                            // We don't have any outcomes, we we should delete any that we have on the graph
                                            if (cellsToDelete != null &&
                                                cellsToDelete.length > 0) {
                                                for (var m = 0; m < cellsToDelete.length; m++) {
                                                    deleteMapElementOutcome(cellsToDelete[m].id);
                                                }
                                            }
                                        }
                                    }

                                    found = true;
                                    break;
                                }
                            }
                        }

                        // The cell was not found, remove it from the graph
                        if (found == false) {
                            deleteCellsFromGraph(graph, [cell]);
                        }
                    }
                }
            }
            finally {
                model.endUpdate();
            }

            graph.getView().refresh();
            graph.getView().validate();

            // Make sure we update the editing session token to say it all worked
            ManyWhoSharedServices.setEditingToken(data.editingToken);

            if (syncSuccessCallback != null) {
                syncSuccessCallback.call(this);
            }
        };
    }

    var editing = function (isEditing) {
        $('#is-editing').val(isEditing);
    }

    var isEditing = function () {
        var value = $('#is-editing').val();

        if (value == 'true' ||
            value == true) {
            value = true;
        } else {
            value = false;
        }

        return value;
    }

    // Generic method to open the dialog page for connectors/outcomes.
    //
    var showOutcomeDialog = function (graphId, operation, elementId, outcomeId, nextElementId) {
        editing(true);
        ManyWhoSharedServices.showMapElementOutcomeConfigDialog(elementId,
                                                                outcomeId,
                                                                graphId,
                                                                operation,
                                                                nextElementId,
                                                                function (elementId, graphId, outcomeId, outcomeDeveloperName, outcome, flowOutcome) {
                                                                    if (flowOutcome != null &&
                                                                        flowOutcome.toLowerCase() == 'delete') {
                                                                        deleteMapElementOutcome(graphId);
                                                                    } else {
                                                                        updateMapElementOutcome(outcomeId, graphId, outcomeDeveloperName, outcome);
                                                                    }
                                                                    editing(false);
                                                                },
                                                                function (graphId, doDelete) {
                                                                    cancelMapElementOutcome(graphId, doDelete);
                                                                    editing(false);
                                                                });
    }

    // Generic method called whenever a group element configuration is changed.
    //
    var updateGroupElement = function (graphId, elementId, elementType, developerName) {
        var graph = editor.graph;
        var model = graph.getModel();
        var cell = null;

        model.beginUpdate();
        try {
            cell = model.getCell(graphId);

            if (cell.getValue() == null) {
                var doc = mxUtils.createXmlDocument();
                var node = doc.createElement('GroupElementNode');

                cell.setValue(node);
            }

            // IE8 doesn't like null assignments to attributes
            if (developerName == null) {
                developerName = '';
            }
            if (elementId == null) {
                elementId = '';
            }
            if (elementType == null) {
                elementType = '';
            }

            cell.getValue().setAttribute('label', developerName);
            cell.getValue().setAttribute('elementId', elementId);
            cell.getValue().setAttribute('elementType', elementType);
            cell.getValue().setAttribute('nodeType', 'group');
        }
        finally {
            model.endUpdate();
        }

        graph.getView().clear(cell, false, false);
        graph.getView().validate();
    }

    // Generic method called whenever a map element configuration is changed.
    //
    var updateMapElement = function (graphId, elementId, elementType, developerName) {
        var graph = editor.graph;
        var model = graph.getModel();
        var cell = null;

        model.beginUpdate();
        try {
            cell = model.getCell(graphId);

            if (cell.getValue() == null) {
                var doc = mxUtils.createXmlDocument();
                var node = doc.createElement('MapElementNode');

                cell.setValue(node);
            }

            if (elementType.toUpperCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_START == true) {
                cell.getValue().setAttribute('label', '<strong>' + developerName + '</strong>');
            } else {
                cell.getValue().setAttribute('label', '<div style="margin-left: 35px; margin-right: 3px; color: #ffffff;">' + developerName + '</div>');
            }

            // IE8 doesn't like null assignments to attributes
            if (elementId == null) {
                elementId = '';
            }
            if (elementType == null) {
                elementType = '';
            }

            cell.getValue().setAttribute('elementId', elementId);
            cell.getValue().setAttribute('elementType', elementType);
            cell.getValue().setAttribute('nodeType', 'map');
        }
        finally {
            model.endUpdate();
        }

        graph.getView().clear(cell, false, false);
        graph.getView().validate();
    }

    // Generic method to update a map element outcome connector.  This is called for insert and update.
    //
    var updateMapElementOutcome = function (outcomeId, graphId, developerName, outcome) {
        var graph = editor.graph;
        var model = graph.getModel();
        var cell = null;

        model.beginUpdate();
        try {
            cell = model.getCell(graphId);
            cell.getValue().setAttribute('label', developerName);
            cell.getValue().setAttribute('outcomeId', outcomeId);
            cell.getValue().setAttribute('nodeType', 'outcome');

            // We store the whole object in the graph for edit and delete events (so we can manage the list manipulation in the flow)
            cell.getValue().setAttribute('outcome', JSON.stringify(outcome));
        }
        finally {
            model.endUpdate();
        }

        graph.getView().clear(cell, false, false);
        graph.getView().validate();
    }

    // Generic method to cancel the dialog page for map elements.
    //
    var cancelMapElement = function (graphId, operation, flowOutcome) {
        if ((operation.toLowerCase() == 'create' && flowOutcome.toLowerCase() == 'cancel') || (operation.toLowerCase() == 'delete' && flowOutcome.toLowerCase() != 'cancel')) {
            deleteMapElement(graphId);
        }
    }

    // Generic method to cancel the dialog page for outcomes.
    //
    var cancelMapElementOutcome = function (graphId, doDelete) {
        if (doDelete == true) {
            deleteMapElementOutcome(graphId);
        }
    }

    // Generic method to cancel the dialog page for group elements.
    //
    var cancelGroupElement = function (graphId, doDelete) {
        if (doDelete == true) {
            deleteGroupElement(graphId);
        }
    }

    // Method used to remove a map element outcome based on the graph id
    //
    var deleteMapElementOutcome = function (graphId) {
        var graph = editor.graph;
        var model = graph.getModel();
        var cell = null;

        model.beginUpdate();
        try {
            // Get the cell based on the graph id
            cell = model.getCell(graphId);

            // Remove the cell and connected edges
            deleteCellsFromGraph(graph, [cell]);
        }
        finally {
            model.endUpdate();
        }
    }

    // Method used to remove a map element based on the graph id
    //
    var deleteMapElement = function (graphId) {
        var graph = editor.graph;
        var model = graph.getModel();
        var cell = null;

        model.beginUpdate();
        try {
            // Get the cell based on the graph id
            cell = model.getCell(graphId);

            // Remove the cell and connected edges
            deleteCellsFromGraph(graph, [cell]);
        }
        finally {
            model.endUpdate();
        }
    }

    // Method used to remove a group element based on the graph id
    //
    var deleteGroupElement = function (graphId) {
        var graph = editor.graph;
        var model = graph.getModel();
        var cell = null;

        model.beginUpdate();
        try {
            // Get the cell based on the graph id
            cell = model.getCell(graphId);

            // Remove the cell and connected edges
            deleteCellsFromGraph(graph, [cell]);
        }
        finally {
            model.endUpdate();
        }
    }

    // This method is used to get a specific graph cell based on the provided id.
    //
    var getMapElementCellFromGraph = function (elementId) {
        var graph = editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var cells = null;
        var mapElements = '';
        var cell = null;

        cells = getChildMapElementCells(graph, parent, false);

        if (cells != null) {
            for (var i = 0; i < cells.length; i++) {
                cell = cells[i];

                var cellElementId = cell.getValue().getAttribute('elementId');

                if (cellElementId == elementId) {
                    break;
                } else {
                    cell = null;
                }
            }
        }

        return cell;
    }

    // This method is used to get a specific graph cell based on the provided id.
    //
    var getGroupElementCellFromGraph = function (elementId) {
        var graph = editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var cells = null;
        var mapElements = '';
        var cell = null;

        cells = getChildGroupElementCells(graph, parent);

        if (cells != null) {
            for (var i = 0; i < cells.length; i++) {
                cell = cells[i];

                var cellElementId = cell.getValue().getAttribute('elementId');

                if (cellElementId == elementId) {
                    break;
                } else {
                    cell = null;
                }
            }
        }

        return cell;
    }

    // Creates a new map element of the specified type
    //
    var createMapElement = function (parent, x, y, elementId, elementType, developerName, useTransaction) {
        var graph = editor.graph;
        var model = graph.getModel();
        var cell;
        var value;
        var width = 120;
        var height = 60;
        var isRelative = true;

        // Only do this if the caller is not providing the parent for us
        if (parent == null) {
            // Get the immediate parent cell
            parent = graph.getCellAt(x, y, graph.getDefaultParent());
            // If we don't pass in the parent, then we assume these are absolute coordinates being passed in
            isRelative = false;
        }

        // Check to make sure that cell is a group
        if (parent != null &&
            parent.getValue() != null &&
            'getAttribute' in parent.getValue()) {
            if (parent.getValue().getAttribute('nodeType') != 'group') {
                parent = null;
            } else if (isRelative == false) {
                var parentX = parent.getGeometry().getPoint().x;
                var parentY = parent.getGeometry().getPoint().y;

                // We need to offset the x and y as it will now be relative to the parent
                x = x - parentX;
                y = y - parentY;
            }
        }

        // If it's not a group or is null, then we use the root parent
        if (parent == null) {
            parent = graph.getDefaultParent();
        }

        if (useTransaction == true) {
            model.beginUpdate();
        }

        try {
            var doc = mxUtils.createXmlDocument();
            var node = doc.createElement('MapElementNode');

            if (developerName == null) {
                developerName = '';
            }

            if (elementType.toUpperCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_START == true) {
                node.setAttribute('label', '<strong>' + developerName + '</strong>');
            } else {
                node.setAttribute('label', '<div style="margin-left: 35px; margin-right: 3px; color: #ffffff;">' + developerName + '</div>');
            }

            // IE8 doesn't like null assignments to attributes
            if (elementId == null) {
                elementId = '';
            }
            if (elementType == null) {
                elementType = '';
            }

            node.setAttribute('elementId', elementId);
            node.setAttribute('elementType', elementType);
            node.setAttribute('nodeType', 'map');

            if (elementType.toUpperCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_START) {
                width = 60;
                height = 60;
            }

            cell = graph.insertVertex(parent, null, node, x, y, width, height, elementType.toUpperCase());
            cell.setConnectable(true);
        }
        finally {
            if (useTransaction == true) {
                model.endUpdate();
            }
        }

        return cell;
    }

    // Creates a new group element of the specified type
    //
    var createGroupElement = function (x, y, height, width, elementId, elementType, developerName, useTransaction) {
        var graph = editor.graph;
        var model = graph.getModel();
        var parent = graph.getDefaultParent();
        var cell;
        var value;
        var shape = '';

        if (useTransaction == true) {
            model.beginUpdate();
        }

        try {
            var doc = mxUtils.createXmlDocument();
            var node = doc.createElement('GroupElementNode');

            // IE8 doesn't like null assignments to attributes
            if (developerName == null) {
                developerName = '';
            }
            if (elementId == null) {
                elementId = '';
            }
            if (elementType == null) {
                elementType = '';
            }

            node.setAttribute('label', developerName);
            node.setAttribute('elementId', elementId);
            node.setAttribute('elementType', elementType);
            node.setAttribute('nodeType', 'group');

            shape = 'swimlane;';

            cell = graph.insertVertex(parent, null, node, x, y, width, height, shape + 'verticalAlign=top;align=left;overflow=hidden;whiteSpace=wrap;');
        }
        finally {
            if (useTransaction == true) {
                model.endUpdate();
            }
        }

        return cell;
    }

    var createBaseGraphStyle = function (graph) {
        var style = new Object();

        // Make the default style a label cell
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_LABEL;
        // Round the edges of the shape so it looks a little nicer
        style[mxConstants.STYLE_ROUNDED] = true;
        // Make sure the edges are pushed out to the edge of the shape
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
        // Disable resizing of the shapes
        style[mxConstants.STYLE_RESIZABLE] = 0;
        // Clip labels that overflow beyond the bounds of the vertex
        style[mxConstants.STYLE_OVERFLOW] = 'hidden';
        // Wrap the labels inside the bounds of the vertex
        style[mxConstants.STYLE_WHITE_SPACE] = 'wrap';
        // Align the label text to the left
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
        // Align the label vertically to the middle so it lines up with the icon
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
        // Add a custom style for the port hover image when the user wants to create an edge
        style['portimage'] = 'https://cdn.manywho.com/extensions/glyphicons/outcomeport.png';
        // Set the label font and size information
        style[mxConstants.STYLE_FONTFAMILY] = 'Helvetica Neue, Helvetica, Arial, sans-serif';
        style[mxConstants.STYLE_FONTSIZE] = '12';
        style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
        // Fill the shape colour
        style[mxConstants.STYLE_FILLCOLOR] = '#ffffff';
        // And set the border colour also
        style[mxConstants.STYLE_STROKECOLOR] = '#999999';

        //style[mxConstants.STYLE_SHADOW] = '1';
        //style[mxConstants.SHADOW_OPACITY] = '0.5';

        return style;
    }

    // Configures the styles for all of the map elements.
    //
    var configureStylesheet = function (graph) {
        var style = null;

        // Assign the global constants
        mxConstants.HIGHLIGHT_COLOR = '#99CC00';
        mxConstants.VERTEX_SELECTION_COLOR = '#DFF0D8';
        mxConstants.EDGE_SELECTION_COLOR = '#DFF0D8';
        mxConstants.SHADOWCOLOR = '#C0C0C0';

        // Create the default style - not really necessary, but done for completeness
        graph.getStylesheet().putDefaultVertexStyle(createBaseGraphStyle(graph));

        // step
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '24';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '16';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_242_google_maps_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#0099CC';
        style[mxConstants.STYLE_STROKECOLOR] = '#0099CC';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_STEP, style);

        // input
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '22';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '22';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_156_show_thumbnails_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#33B5E5';
        style[mxConstants.STYLE_STROKECOLOR] = '#33B5E5';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_INPUT, style);

        // page
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '22';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '22';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_371_global_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#50C0E9';
        style[mxConstants.STYLE_STROKECOLOR] = '#50C0E9';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_PAGE, style);

        // decision
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '26';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '26';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_198_ok_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#9933CC';
        style[mxConstants.STYLE_STROKECOLOR] = '#9933CC';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DECISION, style);

        // message
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '24';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '24';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_054_clock_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#C58BE2';
        style[mxConstants.STYLE_STROKECOLOR] = '#C58BE2';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_MESSAGE, style);

        // operator
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '24';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '24';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_136_cogwheel_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#AC59D6';
        style[mxConstants.STYLE_STROKECOLOR] = '#AC59D6';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_OPERATOR, style);

        // database load
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '24';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '24';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_201_upload_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#CC0000';
        style[mxConstants.STYLE_STROKECOLOR] = '#CC0000';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_LOAD, style);

        // database save
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '26';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '26';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_200_download_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#E92727';
        style[mxConstants.STYLE_STROKECOLOR] = '#E92727';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_SAVE, style);

        // database delete
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_IMAGE_WIDTH] = '26';
        style[mxConstants.STYLE_IMAGE_HEIGHT] = '26';
        style[mxConstants.STYLE_IMAGE] = 'https://cdn.manywho.com/extensions/glyphicons/glyphicons_197_remove_white.png';
        style[mxConstants.STYLE_FILLCOLOR] = '#FF4444';
        style[mxConstants.STYLE_STROKECOLOR] = '#FF4444';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_DATABASE_DELETE, style);

        // start
        style = createBaseGraphStyle(graph);
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
        style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        style[mxConstants.STYLE_FILLCOLOR] = '#52A652';
        style[mxConstants.STYLE_STROKECOLOR] = '#52A652';

        graph.getStylesheet().putCellStyle(ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_START, style);

        style = new Object();
        style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_SWIMLANE;
        style[mxConstants.STYLE_SHADOW] = 0;
        style[mxConstants.STYLE_HORIZONTAL] = 0;
        style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
        style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_TOP;
        style[mxConstants.STYLE_STARTSIZE] = '30';
        style[mxConstants.STYLE_RESIZABLE] = 1;
        style[mxConstants.STYLE_ROUNDED] = false;
        style[mxConstants.STYLE_FILLCOLOR] = '#FF8A00';
        style[mxConstants.STYLE_STROKECOLOR] = '#FF8A00';

        graph.getStylesheet().putCellStyle('swimlane', style);

        style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = '#FFFFFF';
        style[mxConstants.STYLE_STROKEWIDTH] = '2';
        style[mxConstants.STYLE_ROUNDED] = true;
    }

    // Configures the events for the sidebar elements to make sure drag-and-drop events are correctly handled.
    //
    var configureSidebarMapElement = function (graph, elementLocation, elementType, elementName, iconReference, buttonType, developerMode) {
        var dragElt;
        var ds;
        var funct;
        var html = '';

        html += '<div><a class="btn span12 ' + buttonType + '" href="#" id="' + elementType + '-element" style="text-align: left;"><i class="' + iconReference + '"></i> ' + elementName + '</a></div>';

        if (elementLocation == 'user') {
            $('#user-elements').append(html);
        } else if (elementLocation == 'logic') {
            $('#logic-elements').append(html);
        } else if (elementLocation == 'data') {
            $('#data-elements').append(html);
        }

        funct = function (graph, evt, cell, x, y) {
            cell = createMapElement(null, x, y, null, elementType, null, true);

            var parent = graph.getModel().getParent(cell);
            var groupElementId = null;

            if (parent != null &&
                parent.getValue() != null &&
                'getAttribute' in parent.getValue()) {
                groupElementId = parent.getValue().getAttribute('elementId');
            }

            // Show the map element dialog - using the latest cell coordinates - which will have shifted if inserting into a group
            showMapElementDialog(cell.id, 'create', cell.getGeometry().getPoint().x, cell.getGeometry().getPoint().y, elementType, null, groupElementId);
        }

        // Creates a drag effect for the map element
        dragElt = document.createElement('div');
        dragElt.style.border = 'dashed black 1px';
        dragElt.style.width = '120px';
        dragElt.style.height = '60px';

        if (buttonType.indexOf('preview') >= 0 &&
            developerMode == false) {
            // Do nothing - this is disabled
        } else {
            // Creates the image which is used as the drag icon (preview)
            ds = mxUtils.makeDraggable(document.getElementById(elementType + '-element'), graph, funct, dragElt, 0, 0, true, true);
            ds.setGuidesEnabled(true);
        }
    }

    // Configures the events for the sidebar elements to make sure drag-and-drop events are correctly handled.
    //
    var configureSidebarGroupElement = function (graph, elementLocation, elementType, elementName, iconReference, buttonType, developerMode) {
        var dragElt;
        var ds;
        var funct;
        var html = '';

        html += '<div><a class="btn span12 ' + buttonType + '" href="#" id="' + elementType + '-element" style="text-align: left;"><i class="' + iconReference + '"></i> ' + elementName + '</a></div>';

        $('#group-elements').append(html);

        funct = function (graph, evt, cell, x, y) {
            cell = createGroupElement(x, y, 150, 500, null, elementType, null, true);

            // Show the group element dialog
            showGroupElementDialog(cell.id, 'edit', x, y, 150, 500, elementType, null);
        }

        // Creates a drag effect for the group
        dragElt = document.createElement('div');
        dragElt.style.border = 'dashed black 1px';
        dragElt.style.width = '500px';
        dragElt.style.height = '150px';

        if (buttonType.indexOf('preview') >= 0 &&
            developerMode == false) {
            // Do nothing - this is disabled
        } else {
            // Creates the image which is used as the drag icon (preview)
            ds = mxUtils.makeDraggable(document.getElementById(elementType + '-element'), graph, funct, dragElt, 0, 0, true, true);
            ds.setGuidesEnabled(true);
        }
    }

    var updateGraph = function (updateGraphSuccess, changedMapElements, changedGroupElements) {
        if (changedMapElements == null) {
            changedMapElements = getMapElementsFromGraph.call(this);
        }

        if (changedGroupElements == null) {
            changedGroupElements = getGroupElementsFromGraph.call(this);
        }

        ManyWhoFlow.updateGraph('ManyWhoFlow.UpdateGraph',
                                 ManyWhoSharedServices.getEditingToken(),
                                 ManyWhoSharedServices.getFlowId(),
                                 $('#flow-developer-name').val(),
                                 $('#flow-developer-summary').val(),
                                 $('#flow-start-map-element-id').val(),
                                 changedMapElements,
                                 changedGroupElements,
                                 ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                 null,
                                 applyElementsToGraph(updateGraphSuccess),
                                 null);
    }

    // We have this method as it's the same as the standard method used in mxgraph - which has been overridden to prevent deleting
    //
    var deleteCellsFromGraph = function (graph, cells) {
        // If the cells are null, get the selection cells from the graph
        if (cells == null) {
            cells = graph.getDeletableCells(graph.getSelectionCells());
        }

        // Always include edges
        cells = graph.getDeletableCells(graph.addAllEdges(cells));

        // Do the delete
        graph.model.beginUpdate();
        try {
            graph.cellsRemoved(cells);
            graph.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS, "cells", cells, "includeEdges", true));
        } finally {
            graph.model.endUpdate();
        }

        return cells;
    }

    var methods = {
        init: function (options) {
            var output = '';

            output += '<div id="manywho-flow-container">';
            output += '</div>';

            output += '<div id="manywho-flow-outline-container">';
            output += '</div>';

            $(this).replaceWith(output);

            supportedMapElements = new Array();

            var container = document.getElementById('manywho-flow-container');
            var outline = document.getElementById('manywho-flow-outline-container');
            var mapElements = document.getElementById('user-elements');

            // Assigns some global constants for general behaviour, eg. minimum
            // size (in pixels) of the active region for triggering creation of
            // new connections, the portion (100%) of the cell area to be used
            // for triggering new connections, as well as some fading options for
            // windows and the rubberband selection.
            mxConstants.MIN_HOTSPOT_SIZE = 16;
            mxConstants.DEFAULT_HOTSPOT = 1;

            // Enables guides
            mxGraphHandler.prototype.guidesEnabled = true;

            // Alt disables guides
            mxGuide.prototype.isEnabledForEvent = function (evt) {
                return !mxEvent.isAltDown(evt);
            };

            // Enables snapping waypoints to terminals
            mxEdgeHandler.prototype.snapToTerminals = true;

            // Disable drop on any cell except swimlanes
            mxGraph.prototype.isValidDropTarget = function (cell, cells, evt) {
                var elementType = null;

                if (mxUtils.isNode(cell != null && cell.value)) {
                    elementType = cell.getAttribute('elementType', '');
                }

                // We don't want the swimlane to act as a drop target
                if (elementType != null &&
                    elementType.toLowerCase() == ManyWhoConstants.GROUP_ELEMENT_TYPE_IMPLEMENTATION_SWIMLANE.toLowerCase()) {
                    return true;
                } else {
                    return false;
                }
            };

            // Override the remove cells method so we can make sure we open the delete dialog instead of doing the delete
            mxGraph.prototype.removeCells = function (cells, includeEdges) {
                var outcomeOnGraph = null;
                var elementType = null;
                var elementId = null;
                var nodeType = null;
                var cell = null;

                // If include edges is null, make it true
                includeEdges = includeEdges != null ? includeEdges : true;

                // If the cells are null, get the selection cells from the graph
                if (cells == null) {
                    cells = this.getDeletableCells(this.getSelectionCells());
                }

                // If we're including edges, get those also
                if (includeEdges == true) {
                    cells = this.getDeletableCells(this.addAllEdges(cells));
                }

                // Check to see if we have any cells at all
                if (cells == null ||
                    cells.length == 0) {
                    return;
                }

                // Check to see how many cells we're deleting
                if (cells.length > 1) {
                    var cellCount = 0;
                    var parentCell = null;

                    // We need to do a little checking here of what's being deleted so we're handling everything as needed
                    for (var i = 0; i < cells.length; i++) {
                        if (cells[i].edge == false) {
                            parentCell = cells[i];
                            cellCount++;

                            // Check the user isn't deleting more than only parent cell
                            if (cellCount > 1) {
                                alert('You can only delete one element at a time!');
                                return;
                            }
                        }
                    }

                    // We have more than one edge - and therefore we need to cancel the delete
                    if (parentCell == null) {
                        alert('You can only delete one outcome at a time!');
                        return;
                    }

                    // Now we need to check that all of the edges being deleted are going out from the parent
                    for (var i = 0; i < cells.length; i++) {
                        if (cells[i].edge == true) {
                            // Check that this edge is pointing out from the parent
                            if (cells[i].source.id != parentCell.id) {
                                // The edge is coming in to the parent
                                alert('You cannot delete an element if it\'s attached to another cell. Delete the all outcomes that lead to this element first!');
                                return;
                            }
                        }
                    }

                    // If this is all OK, we assign the delete to reference the dialog to the parent cell
                    cell = parentCell;
                } else {
                    // We only have one cell to delete
                    cell = cells[0];
                }

                // Get the node type so we know which cell to delete
                nodeType = cell.getValue().getAttribute('nodeType');

                if (nodeType == 'outcome') {
                    if (cell.source != null) {
                        // Grab the element type and id from the source cell
                        elementType = cell.source.getValue().getAttribute('elementType');
                        elementId = cell.source.getValue().getAttribute('elementId');
                        outcomeId = cell.getValue().getAttribute('outcomeId');

                        // Open the outcome dialog
                        showOutcomeDialog.call(this, cell.id, 'delete', elementId, outcomeId, null);
                        return;
                    } else {
                        alert('You seem to have an outcome that has no parent! We\'ll delete it anyway.');
                    }
                } else if (nodeType == 'group') {
                    // Grab the element type and id from the cell
                    elementType = cell.getValue().getAttribute('elementType');
                    elementId = cell.getValue().getAttribute('elementId');

                    if (cell.getChildCount() > 0) {
                        // Tell the user they cannot delete
                        alert('You cannot delete a group that has map elements inside of it.');
                    } else {
                        // Show the group element dialog
                        showGroupElementDialog(cell.id, 'delete', 0, 0, 0, 0, elementType, elementId);
                    }
                    return;
                } else if (nodeType == 'map') {
                    // Grab the element type and id from the cell
                    elementType = cell.getValue().getAttribute('elementType');
                    elementId = cell.getValue().getAttribute('elementId');

                    if (elementType.toLowerCase() == ManyWhoConstants.MAP_ELEMENT_TYPE_IMPLEMENTATION_START.toLowerCase()) {
                        alert('You can\'t delete the start element!');
                        return;
                    }

                    // Show the map element dialog
                    showMapElementDialog(cell.id, 'delete', 0, 0, elementType, elementId, null);
                    return;
                } else {
                    alert('Hmmm. We don\'t recognize that element but we\'ll delete it from flow editor.');
                }

                // Do the delete
                this.model.beginUpdate();
                try {
                    this.cellsRemoved(cells);
                    this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS, "cells", cells, "includeEdges", includeEdges));
                } finally {
                    this.model.endUpdate();
                }
                    
                return cells;
            };

            // Workaround for Internet Explorer ignoring certain CSS directives
            if (mxClient.IS_IE) {
                new mxDivResizer(container);
                new mxDivResizer(outline);
                new mxDivResizer(mapElements);
            }

            // Creates a wrapper editor with a graph inside the given container.
            // The editor is used to create certain functionality for the
            // graph, such as the rubberband selection, but most parts
            // of the UI are custom in this example.
            editor = new mxEditor();

            var graph = editor.graph;
            var model = graph.getModel();

            var layout = new mxParallelEdgeLayout(graph);

            // Create a new key handler for the editor
            var keyHandler = new mxDefaultKeyHandler(editor);
            keyHandler.bindAction(46, 'delete');
            keyHandler.bindAction(65, 'selectAll', 1);

            // Override a couple of things so the XML nodes work
            graph.convertValueToString = function (cell) {
                if (mxUtils.isNode(cell.value)) {
                    return cell.getAttribute('label', '')
                }
            };
            var cellLabelChanged = graph.cellLabelChanged;
            graph.cellLabelChanged = function (cell, newValue, autoSize) {
                if (mxUtils.isNode(cell.value)) {
                    // Clones the value for correct undo/redo
                    var elt = cell.value.cloneNode(true);
                    elt.setAttribute('label', newValue);
                    newValue = elt;
                }

                cellLabelChanged.apply(this, arguments);
            };

            // Disable highlight of cells when dragging from toolbar
            // CHANGED
            graph.setDropEnabled(true);

            // Uses the port icon while connections are previewed
            graph.connectionHandler.getConnectImage = function (cell) {
                var elementType = null;

                if (mxUtils.isNode(cell.value)) {
                    elementType = cell.getAttribute('elementType', '');
                }

                // We don't want the swimlane to act as a drop target
                if (elementType != null &&
                    elementType.toLowerCase() == ManyWhoConstants.GROUP_ELEMENT_TYPE_IMPLEMENTATION_SWIMLANE.toLowerCase()) {
                    return null;
                } else {
                    return new mxImage(cell.style['portimage'], 16, 16);
                }
            };

            // Uses the port icon while connections are previewed
            graph.connectionHandler.isValidSource = function (cell) {
                var elementType = null;

                if (mxUtils.isNode(cell.value)) {
                    elementType = cell.getAttribute('elementType', '');
                }

                // We don't want the swimlane to act as a drop target
                if (elementType != null &&
                    elementType.toLowerCase() == ManyWhoConstants.GROUP_ELEMENT_TYPE_IMPLEMENTATION_SWIMLANE.toLowerCase()) {
                    return false;
                } else {
                    return graph.isValidSource(graph.getModel().getCell(cell.id));
                }
            };

            graph.connectionHandler.isValidTarget = function (cell) {
                var elementType = null;

                if (mxUtils.isNode(cell.value)) {
                    elementType = cell.getAttribute('elementType', '');
                }

                // We don't want the swimlane to act as a drop target
                if (elementType != null &&
                    elementType.toLowerCase() == ManyWhoConstants.GROUP_ELEMENT_TYPE_IMPLEMENTATION_SWIMLANE.toLowerCase()) {
                    return false;
                } else {
                    return graph.isValidTarget(graph.getModel().getCell(cell.id));
                }
            };

            // Centers the port icon on the target port
            graph.connectionHandler.targetConnectImage = true;

            // Add a connection event to the graph
            graph.getModel().addListener(mxEvent.CHANGE, function (sender, evt) {
                // Get the changes from the event
                var changes = evt.getProperty('edit').changes;
                var applyChanges = false;
                var mapElements = new Array();
                var groupElements = new Array();
                var mapElementsCount = 0;
                var groupElementsCount = 0;

                if (changes != null &&
                    changes.length > 0) {
                    for (var i = 0; i < changes.length; i++) {
                        if (changes[i] instanceof mxGeometryChange) {
                            // We only post back changes to location - all other changes are managed by the server
                            var cell = changes[i].cell;

                            if (cell.getValue() != null &&
                                'getAttribute' in cell.getValue()) {
                                var nodeType = cell.getValue().getAttribute('nodeType');

                                if (nodeType != null &&
                                    nodeType == 'map') {
                                    var parent = this.getParent(cell);
                                    var groupElementId = null;

                                    if (parent != null &&
                                        parent.getValue() != null &&
                                        'getAttribute' in parent.getValue()) {
                                        groupElementId = parent.getValue().getAttribute('elementId');
                                    }

                                    var mapElement = createMapElementFromCell.call(this, parent, groupElementId, cell);

                                    if (mapElement != null) {
                                        mapElements[mapElementsCount] = mapElement;
                                        mapElementsCount++;
                                    }

                                    applyChanges = true;
                                } else if (nodeType != null &&
                                           nodeType == 'group') {
                                    var groupElement = createGroupElementFromCell.call(this, cell);

                                    if (groupElement != null) {
                                        groupElements[groupElementsCount] = groupElement;
                                        groupElementsCount++;
                                    }

                                    applyChanges = true;
                                }
                            }
                        }
                    }
                }

                // Only pass up the map elements if we have some - otherwise null
                if (mapElements.length == 0) {
                    mapElements = null;
                }
                if (groupElements.length == 0) {
                    groupElements = null;
                }

                if (applyChanges == true) {
                    updateGraph.call(this, null, mapElements, groupElements);
                }
            });

            //// Add a cell connection listener to stop edges from overlapping
            //graph.addListener(mxEvent.CELL_CONNECTED, function(sender, evt) {
            //    var model = graph.getModel();
            //    var edge = evt.getProperty('edge');
            //    var src = model.getTerminal(edge, true);
            //    var trg = model.getTerminal(edge, false);

            //    layout.isEdgeIgnored = function(edge2) {
            //        var src2 = model.getTerminal(edge2, true);
            //        var trg2 = model.getTerminal(edge2, false);

            //        return !(model.isEdge(edge2) && ((src == src2 && trg == trg2) || (src == trg2 && trg == src2)));
            //    };
            //});

            // Add a connection event to the graph
            graph.connectionHandler.addListener(mxEvent.CONNECT, function (sender, evt) {
                var elementId = null;
                var elementType = null;
                var nextElementId = null;
                var cell = evt.getProperty('cell');

                if (cell.source != null) {
                    elementId = cell.source.getValue().getAttribute('elementId');
                    elementType = cell.source.getValue().getAttribute('elementType');
                } else {
                    alert('Parent element is returning null - cannot create outcome.');
                    return;
                }

                if (cell.target != null) {
                    nextElementId = cell.target.getValue().getAttribute('elementId');
                } else {
                    alert('Next element is returning null - cannot create outcome.');
                    return;
                }

                var doc = mxUtils.createXmlDocument();
                var node = doc.createElement('OutcomeNode');

                node.setAttribute('label', '');

                cell.setValue(node);

                showOutcomeDialog.call(this, cell.id, 'edit', elementId, null, nextElementId);
            });

            // Does not allow dangling edges
            graph.setAllowDanglingEdges(false);

            // Disable tooltips
            graph.setTooltips(false);

            // Disable cell resizing
            graph.setCellsResizable(true);

            // Sets the graph container and configures the editor
            editor.setGraphContainer(container);
            var config = mxUtils.load('graph/config/keyhandler-commons.xml').getDocumentElement();
            editor.configure(config);

            // Defines the default group to be used for grouping. The
            // default group is a field in the mxEditor instance that
            // is supposed to be a cell which is cloned for new cells.
            // The groupBorderSize is used to define the spacing between
            // the children of a group and the group bounds.
            var group = new mxCell('Group', new mxGeometry(), 'group');
            group.setVertex(true);
            group.setConnectable(false);
            editor.defaultGroup = group;
            editor.groupBorderSize = 20;

            // Disables drag-and-drop into non-swimlanes.
            graph.isValidDropTarget = function (cell, cells, evt) {
                if (cell != null) {
                    //if (cell.edge == true) {
                    //    return false;
                    if (graph.isSwimlane(cell) == true) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            };

            // Disables drilling into non-swimlanes.
            //graph.isValidRoot = function (cell) {
            //    return this.isValidDropTarget(cell);
            //}

            // Does not allow selection of locked cells
            //graph.isCellSelectable = function (cell) {
            //    return !this.isCellLocked(cell);
            //};

            // Returns a shorter label if the cell is collapsed and no
            // label for expanded groups
            graph.getLabel = function (cell) {
                var tmp = mxGraph.prototype.getLabel.apply(this, arguments); // "supercall"

                if (this.isCellLocked(cell)) {
                    // Returns an empty label but makes sure an HTML
                    // element is created for the label (for event
                    // processing wrt the parent label)
                    return '';
                }
                else if (this.isCellCollapsed(cell)) {
                    var index = tmp.indexOf('</h1>');

                    if (index > 0) {
                        tmp = tmp.substring(0, index + 5);
                    }
                }

                return tmp;
            }

            // Disables HTML labels for swimlanes to avoid conflict
            // for the event processing on the child cells. HTML
            // labels consume events before underlying cells get the
            // chance to process those events.
            //
            // NOTE: Use of HTML labels is only recommend if the specific
            // features of such labels are required, such as special label
            // styles or interactive form fields. Otherwise non-HTML labels
            // should be used by not overidding the following function.
            // See also: configureStylesheet.
            graph.isHtmlLabel = function (cell) {
                return !graph.isSwimlane(cell);
            }

            // To disable the folding icon, use the following code:
            /*graph.isCellFoldable = function(cell)
            {
            return false;
            }*/

            // Shows a "modal" window when double clicking a vertex.
            graph.dblClick = function (evt, cell) {
                // Do not fire a DOUBLE_CLICK event here as mxEditor will
                // consume the event and start the in-place editor.
                if (this.isEnabled() &&
			        !mxEvent.isConsumed(evt) &&
			        cell != null &&
			        this.isCellEditable(cell)) {

                    var outcomeId = null;
                    var nodeType = cell.getValue().getAttribute('nodeType');
                    var elementType = cell.getValue().getAttribute('elementType');
                    var elementId = cell.getValue().getAttribute('elementId');
                    var x = cell.getGeometry().getPoint().x;
                    var y = cell.getGeometry().getPoint().y;
                    var parent = this.getModel().getParent(cell);
                    var groupElementId = null;

                    if (parent != null &&
                        parent.getValue() != null &&
                        'getAttribute' in parent.getValue()) {
                        groupElementId = parent.getValue().getAttribute('elementId');
                    }

                    if (elementType != null &&
                        elementType.length > 0) {
                        if (elementType.toLowerCase() == ManyWhoConstants.GROUP_ELEMENT_TYPE_IMPLEMENTATION_SWIMLANE.toLowerCase()) {
                            var width = cell.getGeometry().width;
                            var height = cell.getGeometry().height;

                            showGroupElementDialog(cell.id, 'edit', x, y, height, width, elementType, elementId);
                        } else {
                            showMapElementDialog(cell.id, 'edit', x, y, elementType, elementId, groupElementId);
                        }
                    } else if (nodeType == 'outcome') {
                        elementId = cell.source.getValue().getAttribute('elementId');
                        outcomeId = cell.getValue().getAttribute('outcomeId');

                        // Show the outcome dialog, passing in the outcome object from the graph
                        showOutcomeDialog(cell.id, 'edit', elementId, outcomeId, null);
                    }
                }

                // Need to do double click for connectors - get the source id and load the parent map element to populate the dialog

                // Disables any default behaviour for the double click
                mxEvent.consume(evt);
            };

            // Enables new connections
            graph.setConnectable(true);

            // Adds all required styles to the graph (see below)
            configureStylesheet(graph);

            // Configure the sidebar buttons
            setupMapElements.call(this, graph, options.developerMode);
            setupGroupElements.call(this, graph, options.developerMode);

            // Creates the outline (navigator, overview) for moving
            // around the graph in the top, right corner of the window.
            var outln = new mxOutline(graph, outline);
        },
        //load: function (flowId, loadFlowSuccessCallback) {
        //    editing(false);
        //    ManyWhoFlow.load('ManyWhoMxGraph.Load',
        //                      flowId,
        //                      ManyWhoSharedServices.getAuthorAuthenticationToken(),
        //                      null,
        //                      loadFlowSuccess(loadFlowSuccessCallback),
        //                      null);
        //},
        deleteSelected: function () {
            editor.execute('delete');
        },
        zoomIn: function () {
            editor.execute('zoomIn');
        },
        zoomOut: function () {
            editor.execute('zoomOut');
        },
        actualSize: function () {
            editor.execute('actualSize');
        },
        fit: function () {
            editor.execute('fit');
        },
        clear: function () {
            clearGraph.call(this);
        },
        syncGraph: function (syncSuccessCallback) {
            if (isEditing() == false) {
                ManyWhoFlow.syncGraph('ManyWhoMxGraph.SyncGraph',
                                       ManyWhoSharedServices.getEditingToken(),
                                       ManyWhoSharedServices.getFlowId(),
                                       $('#flow-developer-name').val(),
                                       $('#flow-developer-summary').val(),
                                       $('#flow-start-map-element-id').val(),
                                       getMapElementsFromGraph.call(this),
                                       ManyWhoSharedServices.getAuthorAuthenticationToken(),
                                       null,
                                       applyElementsToGraph(syncSuccessCallback),
                                       null);
            } else {
                ManyWhoLogging.consoleLog('User is currently editing graph - sync will not be performed');
            }
        },
        updateGraph: function (updateSuccessCallback) {
            editing(false);
            updateGraph.call(this, updateSuccessCallback, null);
        }
    };

    $.fn.manywhoMxGraph = function (method) {
        // Method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.manywhoMxGraph');
        }
    };

})(jQuery);
