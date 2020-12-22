<?php
  include('../conf/db_connection.php');

  if ((isset($_POST['all_orders']) && $_POST['day_filter']) ) {
    $DayOpen = html_entity_decode(mysqli_real_escape_string($con, $_POST['day_filter']));

    $sales = new stdClass();

    if (strlen($DayOpen) == 0 || $DayOpen == null) {
      $sales->error = true;
      $sales->message = 'Please provide day to check';

    } else {
      $UserData = mysqli_fetch_array($query);
      $sales->error = false;

      // Get orders
      $OrdersList = array();
      $Orders = mysqli_query($con, "SELECT client_companies.company_name AS client_name,client_orders.order_id,client_orders.time, client_orders.bill_No,restaurant_tables.table_name,client_orders.date,client_orders.status,client_orders.description,pos_companies.user_name AS waiter FROM client_orders INNER JOIN restaurant_tables ON client_orders.table_id=restaurant_tables.table_id
                  LEFT JOIN pos_companies ON client_orders.waiter=pos_companies.user_id
                  LEFT JOIN client_companies ON client_orders.client_company_id=client_companies.clientCompany_id WHERE client_orders.date='".$DayOpen."' ORDER BY client_orders.order_id DESC ");

      while($order = mysqli_fetch_array($Orders)) {
        $OrderId = $order['order_id'];
        // Get bill sum
        $billSum = mysqli_query($con, "SELECT SUM(menu_item_price) AS bill_sum FROM order_items WHERE order_id=".$OrderId." ");
        $BillTotal = mysqli_fetch_array($billSum);

        $OrdersItem = new stdClass();
        $OrdersItem->bill_sum = (float)$BillTotal[bill_sum];
        $OrdersItem->bill_sum_display = number_format($BillTotal[bill_sum]);
        $OrdersItem->order_id = $order[order_id];
        $OrdersItem->bill_no = $order[bill_No];
        $OrdersItem->table = $order[table_name];
        $OrdersItem->date = $order[date];
        $OrdersItem->time = $order[time];
        $OrdersItem->status = (int)$order[status];
        $OrdersItem->description = $order[description];
        $OrdersItem->waiter = $order[waiter];
        $OrdersItem->client_name = $order[client_name];
        array_push($OrdersList, $OrdersItem);
      }
      
      $sales->orders = $OrdersList;
      $object->data = $sales;
    }
    echo json_encode($object);

  } else if (isset($_POST['get_order_items'])) {
    $OrderId = html_entity_decode(mysqli_real_escape_string($con, $_POST['get_order_items']));

    $sales = new stdClass();

    if (strlen($OrderId) == 0 || $OrderId == null) {
      $sales->error = true;
      $sales->message = 'Please provide order id';
    }

    $TotalBillAmount = 0;
    $Items = array();
    $GetDistinctItems = mysqli_query($con, "SELECT DISTINCT(menu_item_id) as item_id FROM order_items WHERE order_id=".$OrderId." ");
    while ($Item      = mysqli_fetch_array($GetDistinctItems)) {
      $MenuItemId   = $Item['item_id'];
      $ItemStatus   = FALSE;
      $ItemsCount   = 0;

      // Get Item Name
      $GetMenuItemName = mysqli_query($con, "SELECT item_name,display from menu_items WHERE item_id=".$MenuItemId." LIMIT 1 ");
      $MenuItemDetails  = mysqli_fetch_array($GetMenuItemName);
      $ItemName     = $MenuItemDetails['item_name'];
      $ItemScreen   = $MenuItemDetails['display'];

      // Get Item Amount
      $ItemQuantityAndPrice = mysqli_query($con, "SELECT order_item_id,menu_item_price, quantity,notes,status,shift_note from order_items WHERE menu_item_id=".$MenuItemId." AND order_id=".$OrderId." ");
      $TotalQuantity =0;
      $ItemTotalCost = 0;
      $itemStatus = 1;
      $ItemsAppend = array();

      while ($ItemCost = mysqli_fetch_array($ItemQuantityAndPrice)) {
        $ItemPrice = $ItemCost['menu_item_price'];
        $Quantity = $ItemCost['quantity'];
        $ItemStatus = $ItemCost['status'];
        $ItemId = $ItemCost['order_item_id'];
        $notes = $ItemCost['notes'];
        $ItemTotalCost+=$ItemPrice;
        $TotalQuantity+=$Quantity;

        // Append items
        $ItemListing = new stdClass(); 
        $ItemListing->id = $ItemId;
        $ItemListing->notes = $notes;
        $ItemListing->quantity = $Quantity;
        $ItemListing->amount = number_format($ItemPrice);
        $ItemListing->name = $ItemName;

        array_push($ItemsAppend, $ItemListing);

        if ($ItemStatus == 0) {
          $itemStatus = 0;
        }
      }
      
      $OrdersItem = new stdClass();  

      $OrdersItem->item_name = $ItemName;
      $OrdersItem->amount   = number_format((float)$ItemTotalCost);
      $OrdersItem->quantity = (float)$TotalQuantity;
      $OrdersItem->status = $itemStatus;
      $OrdersItem->notes = '';
      $OrdersItem->id = $MenuItemId;
      $OrdersItem->shift_note = '';
      $OrdersItem->items_list = $ItemsAppend;

      array_push($Items, $OrdersItem);
      // Calcular
      $MenuItemAmount = ($ItemTotalCost);
      $TotalBillAmount+=$MenuItemAmount;

    }

    $sales->total_amount = $TotalBillAmount;
    $sales->total_amount_display = number_format($TotalBillAmount);
    $sales->data = $Items;
    echo json_encode($sales);
  }
