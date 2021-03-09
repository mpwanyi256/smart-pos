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
      store_items.pack_size, store_items.minimum_stock, unit_measurements.measurement,
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

        array_push($ItemsArray, $Item);
      }

      $response->data = $ItemsArray;
      echo json_encode($response);
  }
