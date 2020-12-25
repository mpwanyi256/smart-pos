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
      $Orders = mysqli_query($con, "SELECT client_companies.company_name AS client_name,
      client_companies.last_name,client_companies.tin,client_companies.address,client_companies.email_id,client_companies.contact_number,client_orders.order_id,client_orders.time, client_orders.bill_No,restaurant_tables.table_name,client_orders.date,client_orders.status,client_orders.description,pos_companies.user_name AS waiter FROM client_orders INNER JOIN restaurant_tables ON client_orders.table_id=restaurant_tables.table_id
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

        // Client info
        $MyClient = new stdClass();
        $MyClient->firstname = $order[client_name];
        $MyClient->lasname = $order[last_name];
        $MyClient->tin = $order[tin];
        $MyClient->address = $order[address];
        $MyClient->email = $order[email_id];
        $MyClient->contact_number = $order[contact_number];

        $OrdersItem->client_info = $MyClient;

        // Get Discount
        $OrderDiscount = mysqli_query($con, "SELECT amount_settled AS discount_amount, discount_note FROM order_settements WHERE order_id=".$OrderId." AND settlement_type=88 ");
        $Discount      = mysqli_fetch_array($OrderDiscount);
        $BillDiscount  = (float)($Discount['discount_amount'] * -1);
        $DiscountReason= $Discount['discount_note'];


        $OrdersItem->discount = number_format($BillDiscount);
        $OrdersItem->discount_reason = $DiscountReason;
        $OrdersItem->final_amount = number_format(($BillTotal[bill_sum] - $BillDiscount));

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
    $sales->data = $Items;
    echo json_encode($sales);

  } else if (isset($_POST['get_settlements']) && isset($_POST['settlement_date']) ) {

    $SalesDate   = html_entity_decode(mysqli_real_escape_string($con, $_POST['settlement_date']));
    $Settlements = new stdClass();
    $Settlements->error = false;
    $PaymentSettlements = array();

    if (strlen($SalesDate) == 0 || $SalesDate == null) {
      $Settlements->error = true;
      $Settlements->message = 'Sales date is missing';
    }

    // Get All settlement Options
    $DbSettlements = mysqli_query($con, "SELECT * FROM settlements WHERE settlement NOT IN('SPLIT SETTLEMENT', 'EFT', 'CHEQUE', 'PENDING') ORDER BY settlement ASC");
    while($settlement = mysqli_fetch_array($DbSettlements)) {
      $SettlementId   = $settlement['settlement_id'];
      $Settlement     = $settlement['settlement'];

      $AmountSettled  = mysqli_query($con, "SELECT SUM(order_settements.amount_settled) AS total_amount FROM order_settements INNER JOIN client_orders ON client_orders.order_id = order_settements.order_id WHERE order_settements.settlement_type=".$SettlementId." AND client_orders.date='".$SalesDate."' ");
      $FetchSettlement= mysqli_fetch_array($AmountSettled);
      $TotalAmount    = number_format($FetchSettlement['total_amount']);

      $Info = new stdClass();
      $Info->settlement_name = $Settlement;
      $Info->settlement_id = $SettlementId;
      $Info->amount = $TotalAmount;

      array_push($PaymentSettlements, $Info);
    }

    // Discounts
    $Disc       = mysqli_query($con, "SELECT SUM(order_settements.amount_settled) AS total_Dicsount FROM order_settements INNER JOIN client_orders ON client_orders.order_id = order_settements.order_id WHERE order_settements.settlement_type IN(88) AND client_orders.date='".$SalesDate."' ");
    $FetchDisc  = mysqli_fetch_array($Disc);
    $Discount   = number_format($FetchDisc['total_Dicsount']*(-1));
    $DiscountInfo = new stdClass();
    $DiscountInfo->settlement_name = 'Discounts';
    $DiscountInfo->settlement_id = 88;
    $DiscountInfo->amount = $Discount;
    array_push($PaymentSettlements, $DiscountInfo);

    // Get departments
    $DepartmentSettlements = array();
    $DbDepartments    = mysqli_query($con, "SELECT * FROM store_departments WHERE sd_name NOT IN ('VAT') ");
    while($department = mysqli_fetch_array($DbDepartments)) {
      $DepartmentId   = (int)$department['sd_id'];
      $DeptName       = $department['sd_name'];

      $DepartmentSales= new stdClass();
      $TotalSale      = mysqli_query($con, "SELECT SUM(order_items.menu_item_price) AS department_sale FROM order_items INNER JOIN menu_items ON order_items.menu_item_id=menu_items.item_id INNER JOIN client_orders ON order_items.order_id=client_orders.order_id WHERE client_orders.date='".$SalesDate."' AND client_orders.status NOT IN(0,9) AND menu_items.display=".$DepartmentId." ");
      $Data           = mysqli_fetch_array($TotalSale);
      $Sale           = (float)$Data['department_sale'];

      $DepartmentSales->name   = $DeptName;
      $DepartmentSales->id     = $DepartmentId;
      $DepartmentSales->amount = number_format($Sale);

      array_push($DepartmentSettlements, $DepartmentSales);
    }




    $response = new stdClass();
    $response->settlements = $PaymentSettlements;
    $response->departments = $DepartmentSettlements;
    $Settlements->data = $response;
    echo json_encode($Settlements);

  } else if (isset($_POST['cancel_order_item']) && isset($_POST['cancelled_by']) && isset($_POST['reason']) ) {
    $OrderItemId   = html_entity_decode(mysqli_real_escape_string($con, $_POST['cancel_order_item']));
    $Reason        = html_entity_decode(mysqli_real_escape_string($con, $_POST['reason']));
    $CancelledBy   = html_entity_decode(mysqli_real_escape_string($con, $_POST['cancelled_by']));
    $OrderId       = html_entity_decode(mysqli_real_escape_string($con, $_POST['order_id']));
    $OrderDate     = html_entity_decode(mysqli_real_escape_string($con, $_POST['order_date']));

    $response = new stdClass();

    // Delete Item
    $Drop = mysqli_query($con, "DELETE FROM order_items WHERE order_item_id=".$OrderItemId." ");
    if($Drop) {
      $AddToCancellations = mysqli_query($con, "INSERT INTO
        cancellations(menu_item_id,order_id,reason,cancellation_date,cancelled_by)
        VALUES(".$OrderItemId.",".$OrderId.",'".$Reason."','".$OrderDate."',".$CancelledBy.") ");

      if ($AddToCancellations) {
        // Update order
        $OrderUpdate = mysqli_query($con, "UPDATE client_orders SET status=0 WHERE order_id=".$OrderId." ");
        if($OrderUpdate) {
          $DropSettlements = mysqli_query($con, "DELETE FROM order_settements WHERE order_id=".$OrderId." ");
          if ($DropSettlements) {
            $response->data = 'Success';
          } else {
            $response->message = 'Settlements Deletion failed';
            $response->error = true;
          }
        } else {
          $response->message = 'Client orders Update failed';
          $response->error = true;
        }

        $response->data = 'Success';
      } else {
        $response->message = 'Add to cancellations failed';
        $response->error = true;
      }

    } else {
      $response->message = 'Delete failed';
      $response->error = true;
    }

    echo json_encode($response);

  } else if ( isset($_POST['get_pos_clients']) ) {
      $ClientName = html_entity_decode(mysqli_real_escape_string($con, $_POST['get_pos_clients']));

      if(strlen($ClientName) == 0 || $ClientName == null || $ClientName = 'all') {
        $Clients = "SELECT * FROM client_companies ORDER BY company_name ASC";
      } else {
        $Clients = "SELECT * FROM client_companies WHERE company_name LIKE
                    '%".$ClientName."%' 
                    OR company_name LIKE '%".$ClientName."%'
                    OR tin LIKE '%".$ClientName."%'
                    OR email_id LIKE '%".$ClientName."%'
                    OR contact_number LIKE '%".$ClientName."%' ";
      }

      $ClientsArray = array();
      $Query = mysqli_query($con, $Clients);
      while($client = mysqli_fetch_array($Query)) {
        $ClientData = new stdClass();
        $ClientData->id = $client[clientCompany_id];
        $ClientData->full_name = $client[company_name] .' '. $client[last_name];
        $ClientData->tin = $client[tin];
        $ClientData->address = $client[address];
        $ClientData->email = $client[email_id];
        $ClientData->contact = $client[contact_number];

        array_push($ClientsArray, $ClientData);
      }

      $response = new stdClass();
      $response->error = false;
      $response->data = $ClientsArray;
      echo json_encode($response);
  } else if (isset($_POST['find_bill']) && isset($_POST['from']) && isset($_POST['to']) && isset($_POST['client_id']) ) {
    $BillNumber = html_entity_decode(mysqli_real_escape_string($con, $_POST['find_bill']));
    $From       = html_entity_decode(mysqli_real_escape_string($con, $_POST['from']));
    $To         = html_entity_decode(mysqli_real_escape_string($con, $_POST['to']));
    $ClientId   = html_entity_decode(mysqli_real_escape_string($con, $_POST['client_id']));

    $sales = new stdClass();

    if (strlen($BillNumber) > 0) {
      $Query = "SELECT client_companies.company_name AS client_name,
                client_companies.last_name,client_companies.tin,client_companies.address,client_companies.email_id,client_companies.contact_number,client_orders.order_id,client_orders.time, client_orders.bill_No,restaurant_tables.table_name,client_orders.date,client_orders.status,client_orders.description,pos_companies.user_name AS waiter FROM client_orders INNER JOIN restaurant_tables ON client_orders.table_id=restaurant_tables.table_id
                LEFT JOIN pos_companies ON client_orders.waiter=pos_companies.user_id
                LEFT JOIN client_companies ON client_orders.client_company_id=client_companies.clientCompany_id WHERE client_orders.bill_No='".$BillNumber."' ORDER BY client_orders.order_id DESC";
    
    } else if (strlen($BillNumber) == 0 && $ClientId == 0) { // Search by date
      $sales->error = false;
      $Query = "SELECT client_companies.company_name AS client_name, settlements.settlement,
                client_companies.last_name,client_companies.tin,client_companies.address,client_companies.email_id,client_companies.contact_number,client_orders.order_id,client_orders.time, client_orders.bill_No,restaurant_tables.table_name,client_orders.date,client_orders.status,client_orders.description,pos_companies.user_name AS waiter FROM client_orders INNER JOIN restaurant_tables ON client_orders.table_id=restaurant_tables.table_id
                LEFT JOIN pos_companies ON client_orders.waiter=pos_companies.user_id
                LEFT JOIN client_companies ON client_orders.client_company_id=client_companies.clientCompany_id
                LEFT JOIN settlements ON client_orders.status=settlements.settlement_id
                WHERE client_orders.date BETWEEN '".$From."' AND '".$To."' ORDER BY client_orders.order_id DESC";
    } else if (strlen($BillNumber) == 0 && $ClientId > 0) { // Search by date
      $sales->error = false;
      $Query = "SELECT client_companies.company_name AS client_name, settlements.settlement,
                client_companies.last_name,client_companies.tin,client_companies.address,client_companies.email_id,client_companies.contact_number,client_orders.order_id,client_orders.time, client_orders.bill_No,restaurant_tables.table_name,client_orders.date,client_orders.status,client_orders.description,pos_companies.user_name AS waiter FROM client_orders INNER JOIN restaurant_tables ON client_orders.table_id=restaurant_tables.table_id
                LEFT JOIN pos_companies ON client_orders.waiter=pos_companies.user_id
                LEFT JOIN client_companies ON client_orders.client_company_id=client_companies.clientCompany_id 
                LEFT JOIN settlements ON client_orders.status=settlements.settlement_id 
                WHERE client_orders.date BETWEEN '".$From."' AND '".$To."' AND client_orders.client_company_id=".$ClientId." ORDER BY client_orders.order_id DESC";
    } else {
      $sales->error = true;
      $sales->message = 'Invalid search params';
    }
    
    $OrdersList = array();
    $OrdersFilter = mysqli_query($con, $Query);
    while($order = mysqli_fetch_array($OrdersFilter)) {
      $OrderId = $order['order_id'];
      // Get bill sum
      $billSum = mysqli_query($con, "SELECT SUM(menu_item_price) AS bill_sum FROM order_items WHERE order_id=".$OrderId." ");
      $BillTotal = mysqli_fetch_array($billSum);

      $OrdersItem = new stdClass();
      $OrdersItem->bill_no = $order[bill_No];
      $OrdersItem->order_id = $order[order_id];
      $OrdersItem->table = $order[table_name];
      $OrdersItem->date = date('d-M-y', strtotime($order[date]));
      $OrdersItem->time = $order[time];
      $OrdersItem->bill_sum = (float)$BillTotal[bill_sum];
      $OrdersItem->bill_sum_display = number_format($BillTotal[bill_sum]);
      $OrdersItem->status = (int)$order[status];
      $OrdersItem->waiter = $order[waiter];
      $OrdersItem->client_name = $order[client_name];
      $OrdersItem->description = (String)$order[description];
      $OrdersItem->settlement = $order[settlement];

      // Client info
      $MyClient = new stdClass();
      $MyClient->firstname = $order[client_name];
      $MyClient->lasname = $order[last_name];
      $MyClient->tin = $order[tin];
      $MyClient->address = $order[address];
      $MyClient->email = $order[email_id];
      $MyClient->contact_number = $order[contact_number];

      $OrdersItem->client_info = $MyClient;

      // Get Discount
      $OrderDiscount = mysqli_query($con, "SELECT amount_settled AS discount_amount, discount_note FROM order_settements WHERE order_id=".$OrderId." AND settlement_type=88 ");
      $Discount      = mysqli_fetch_array($OrderDiscount);
      $BillDiscount  = (float)($Discount['discount_amount'] * -1);
      $DiscountReason= $Discount['discount_note'];


      $OrdersItem->discount = number_format($BillDiscount);
      $OrdersItem->discount_reason = $DiscountReason;
      $OrdersItem->final_amount = number_format(($BillTotal[bill_sum] - $BillDiscount));

      array_push($OrdersList, $OrdersItem);

    } 
    
    $response = new stdClass();
    $response->orders = $OrdersList;

    $sales->data = $response;
    echo json_encode($sales);

  }
