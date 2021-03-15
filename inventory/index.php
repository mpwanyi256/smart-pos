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

    $query = mysqli_query($con, "SELECT inv_store_items.item_id,inv_store_items.item_name, inv_store_items.unit_price,
      inv_store_items.pack_size, inv_store_items.minimum_stock,inv_store_items.measurement_id AS item_measure_id, unit_measurements.measurement,
      inv_store_item_categories.name, inv_store_item_categories.id AS category_id FROM inv_store_items
      INNER JOIN unit_measurements ON unit_measurements.measure_id=inv_store_items.measurement_id
      INNER JOIN inv_store_item_categories ON inv_store_item_categories.id=inv_store_items.item_categoryid
      WHERE inv_store_items.company_id=".$CompanyId." ORDER BY inv_store_items.item_name ASC ");


      while($Store = mysqli_fetch_array($query)) {
        $Item = new stdClass();
        $Item->id = (int)$Store['item_id'];
        $Item->name = $Store['item_name'];
        $Item->unit_price = (int)$Store['unit_price'];
        $Item->unit_price_display = number_format($Store['unit_price']);
        $Item->pack_size = (int)$Store['pack_size'];
        $Item->min_stock = (int)$Store['minimum_stock'];
        $Item->unit_measure = $Store['measurement'];
        $Item->category = $Store['name'];
        $Item->category_id = (int)$Store['category_id'];
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

  } else if(isset($_POST['get_store_categories'])) {
    $CategoryId    = html_entity_decode(mysqli_real_escape_string($con, $_POST['get_store_categories']));
    $Categories    = array();

    if ($CategoryId == 'all' || $CategoryId == null) {
      $query = mysqli_query($con, "SELECT * FROM inv_store_item_categories ORDER BY name ASC");
    } else {
      $query = mysqli_query($con, "SELECT * FROM inv_store_item_categories WHERE id=".$CategoryId." ORDER BY name ASC");
    }

    while($Cat = mysqli_fetch_array($query)) {
      $CatItem = new stdClass();
      $CatItem->id = (int)$Cat['id'];
      $CatItem->name = $Cat['name'];

      array_push($Categories, $CatItem);
    }

    $response->data = $Categories;


  } else if(isset($_POST['update_store_item'])) {
    $ItemId     = html_entity_decode(mysqli_real_escape_string($con, $_POST['update_store_item']));
    $Name       = html_entity_decode(mysqli_real_escape_string($con, $_POST['name']));
    $PackSize   = html_entity_decode(mysqli_real_escape_string($con, $_POST['pack_size']));
    $MeasureId  = html_entity_decode(mysqli_real_escape_string($con, $_POST['unit_measure_id']));
    $UnitPrice  = html_entity_decode(mysqli_real_escape_string($con, $_POST['unit_price']));
    $CategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_id']));
    $MinStock   = html_entity_decode(mysqli_real_escape_string($con, $_POST['minimum_stock']));

    $UpdateItem = mysqli_query($con, "UPDATE inv_store_items SET item_name='".$Name."', item_categoryid=".$CategoryId.",
                  unit_price=".$UnitPrice.", measurement_id=".$MeasureId.", pack_size=".$PackSize.", minimum_stock=".$MinStock."
                  WHERE item_id=".$ItemId." ");

    if (UpdateItem) {
      $response->error = false;
      $response->message = 'Success';
    } else {
      $response->error = true;
      $response->message = 'Updade failed';
    }

  } else if (isset($_POST['create_store_item'])) {
    $Name       = html_entity_decode(mysqli_real_escape_string($con, $_POST['name']));
    $PackSize   = html_entity_decode(mysqli_real_escape_string($con, $_POST['pack_size']));
    $MeasureId  = html_entity_decode(mysqli_real_escape_string($con, $_POST['unit_measure_id']));
    $UnitPrice  = html_entity_decode(mysqli_real_escape_string($con, $_POST['unit_price']));
    $CategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_id']));
    $MinStock   = html_entity_decode(mysqli_real_escape_string($con, $_POST['minimum_stock']));
    $company_id = html_entity_decode(mysqli_real_escape_string($con, $_POST['company_id']));

    $CheckItem  = mysqli_query($con, "SELECT * FROM inv_store_items WHERE item_name='".$Name."' 
                  AND item_categoryid=".$CategoryId." AND company_id=".$company_id." ");
    
    if (mysqli_num_rows($CheckItem) == 0) {
      $InsertItem = mysqli_query($con, "INSERT INTO inv_store_items(item_name,item_categoryid,unit_price,measurement_id,pack_size,minimum_stock,company_id)
                    VALUES('".$Name."',".$CategoryId.",".$UnitPrice.",".$MeasureId.",".$PackSize.",".$MinStock.",".$company_id.") ");

      if ($InsertItem) {
        $response->error = false;
        $response->message = 'Success';
      } else {
        $response->error = true;
        $response->message = 'Sorry, something went wrong';
      }
    } else {
      $response->error = true;
      $response->message = 'Sorry, Item already exists';
    }

  } else if(isset($_POST['delete_store_item'])) {
    $ItemId = html_entity_decode(mysqli_real_escape_string($con, $_POST['delete_store_item']));
    $DropItem = mysqli_query($con, "DELETE FROM inv_store_items WHERE item_id=".$ItemId." ");

    // Refactor later when finished with invoices creation
    if ($DropItem) {
      $response->error = false;
      $response->message = 'Success';
    } else {
      $response->error = true;
      $response->message = 'Sorry, delete failed';
    }
  }


  echo json_encode($response);
