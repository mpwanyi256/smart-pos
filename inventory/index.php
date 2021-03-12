<?php
  include('../conf/db_connection.php');
  $response = new stdClass();

  if (isset($_POST['get_store_items'])) {

    $CompanyId = html_entity_decode(mysqli_real_escape_string($con, $_POST['company_id']));

    if ($CompanyId == null || strlen($CompanyId) <= 0) {
      $response->error = true;
      $response->message = 'Company Id is required';
    }

    $ItemsArray = array();

    $query = mysqli_query($con, "SELECT store_items.item_id,store_items.item_name, store_items.unit_price,
      store_items.pack_size, store_items.minimum_stock,store_items.measurement_id AS item_measure_id, unit_measurements.measurement,
      store_item_categories.category_name FROM store_items
      INNER JOIN unit_measurements ON unit_measurements.measure_id=store_items.measurement_id
      INNER JOIN store_item_categories ON store_item_categories.category_id=store_items.item_categoryid
      WHERE store_items.company_id=".$CompanyId." ORDER BY store_items.item_name ASC ");


      while($Store = mysqli_fetch_array($query)) {
        $Item = new stdClass();
        $Item->id = (int)$Store['item_id'];
        $Item->name = $Store['item_name'];
        $Item->unit_price = (int)$Store['unit_price'];
        $Item->unit_price_display = number_format($Store['unit_price']);
        $Item->pack_size = (int)$Store['pack_size'];
        $Item->min_stock = (int)$Store['minimum_stock'];
        $Item->unit_measure = $Store['measurement'];
        $Item->category = $Store['category_name'];
        $Item->measure_id = (int)$Store['item_measure_id'];

        array_push($ItemsArray, $Item);
      }

      $response->data = $ItemsArray;

  } else if (isset($_POST['get_measures'])) {
    $AllMeasures = array();
    $Measure = html_entity_decode(mysqli_real_escape_string($con, $_POST['get_measures']));

    $query = mysqli_query($con, "SELECT unit_measurements.*,pos_companies.user_name FROM unit_measurements INNER JOIN pos_companies ON pos_companies.user_id=unit_measurements.created_by ORDER BY unit_measurements.measurement ASC");
    while($item = mysqli_fetch_array($query)) {
      $MeasureItem = new stdClass();
      $MeasureItem->id = (int)$item['measure_id'];
      $MeasureItem->name = $item['measurement'];
      $MeasureItem->company = (int)$item['company_id'];
      $MeasureItem->added_by = $item['user_name'];

      array_push($AllMeasures, $MeasureItem);
    }

    $response->data = $AllMeasures;

  } else if(isset($_POST['update_store_item'])) {
    $ItemId    = html_entity_decode(mysqli_real_escape_string($con, $_POST['update_store_item']));
    $Name      = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_name']));
    $PackSize  = html_entity_decode(mysqli_real_escape_string($con, $_POST['pack_size']));
    $MeasureId = html_entity_decode(mysqli_real_escape_string($con, $_POST['unit_measure_id']));
    $UnitPrice = html_entity_decode(mysqli_real_escape_string($con, $_POST['unit_price']));

  }


  echo json_encode($response);
