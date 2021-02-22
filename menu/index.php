<?php
  include('../conf/db_connection.php');

  if (isset($_POST['get_menu_items'])) {
    $DepartmentId = html_entity_decode(mysqli_real_escape_string($con, $_POST['get_menu_items']));

    if ($DepartmentId == 0 || $DepartmentId == null) {
      $query = "SELECT * FROM menu_items ORDER BY item_name ASC LIMIT 50";
    } else {
      $query = "SELECT * FROM menu_items WHERE display=".$DepartmentId." ORDER BY item_name ASC";
    }

    $menuItems = new stdClass();
    $menuItems->error = false;
    $MenuItems = array();

    $DbItems = mysqli_query($con, $query);
    while($Item = mysqli_fetch_array($DbItems)) {
      $dbItem = new stdClass();
      $dbItem->id = $Item['item_id'];
      $dbItem->name = $Item['item_name'];
      $dbItem->price = $Item['item_price'];
      $dbItem->price_display = number_format($Item['item_price']);
      $dbItem->category_id = $Item['item_category_id'];
      $dbItem->display = (int)$Item['display'];
      $dbItem->status = (int)$Item['hide'];
      
      array_push($MenuItems, $dbItem);
    }
    $menuItems->data = $MenuItems;
    echo json_encode($menuItems);
  
  } else if (isset($_POST['get_departments'])) {
    $response = new stdClass();
    $response->error = false;

    $DepartmentsArray = array();
    $Departments = mysqli_query($con, "SELECT * FROM store_departments WHERE sd_name NOT IN('VAT') ORDER BY sd_name ASC ");
    while($Dept  = mysqli_fetch_array($Departments)) {
      $DeptItem  = new stdClass();
      $DeptItem->id = $Dept['sd_id'];
      $DeptItem->name = $Dept['sd_name'];

      array_push($DepartmentsArray, $DeptItem);
    }

    $response->data = $DepartmentsArray;

    echo json_encode($response);

  } else if(isset($_POST['update_item_status'])) {
    $ItemId = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_id']));
    $Status = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_status']));
    if ($Status == 0) {
      $UpdateStatus = 1;
    } else {
      $UpdateStatus = 0;
    }

    $UpdateQuery = mysqli_query($con, "UPDATE menu_items SET hide=".$UpdateStatus." WHERE item_id=".$ItemId." ");
    $response = new stdClass();
    if ($UpdateQuery) {
      $response->error = false;
      $response->message = 'Updated successfully';
    } else {
      $response->error = true;
      $response->message = 'Update failed';
    }

    echo json_encode($response);

  } else if(isset($_POST['get_menu_categories'])) {
    $response = new stdClass();
    $Categories = array();
    // $ItemCategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['get_menu_categories']));
    $Query = mysqli_query($con, "SELECT * FROM categoriies WHERE category NOT IN('OPEN DISH, VAT') ORDER BY category ASC");

    while($Cat       = mysqli_fetch_array($Query)) {
      $CatItem       = new stdClass();
      $CatItem->id   = $Cat['category_id'];
      $CatItem->name = $Cat['category'];
      $CatItem->department_id = $Cat['department_id'];
      $CatItem->status = $Cat['status'];
      array_push($Categories, $CatItem);
    }

    $response->error = false;
    $response->data = $Categories;

    echo json_encode($response);
  }
