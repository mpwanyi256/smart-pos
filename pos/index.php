<?php
  include('../conf/db_connection.php');

  if (isset($_POST['get_menu_items'])) {
    $CategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['get_menu_items']));
    $ItemName   = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_name']));

    if ($ItemName == 'all') {
      if($CategoryId == 'download') {
        // Download all menu items
        $query = "SELECT menu_items.*, categoriies.category,store_departments.sd_name AS display_name FROM menu_items
                  INNER JOIN categoriies ON menu_items.item_category_id=categoriies.category_id
                  INNER JOIN store_departments ON store_departments.sd_id=menu_items.display
                  WHERE categoriies.category NOT IN('OPEN DISH', 'VAT') ORDER BY menu_items.item_name ASC";
      } else if ($CategoryId == 0 || $CategoryId == null || $CategoryId == 'all') {
        $query = "SELECT menu_items.*, categoriies.category,store_departments.sd_name AS display_name FROM menu_items
                  INNER JOIN categoriies ON menu_items.item_category_id=categoriies.category_id
                  INNER JOIN store_departments ON store_departments.sd_id=menu_items.display
                  WHERE categoriies.category NOT IN('OPEN DISH', 'VAT') ORDER BY item_name ASC LIMIT 50";
      } else {
        $query = "SELECT menu_items.*, categoriies.category,store_departments.sd_name AS display_name FROM menu_items
                  INNER JOIN categoriies ON menu_items.item_category_id=categoriies.category_id
                  INNER JOIN store_departments ON store_departments.sd_id=menu_items.display
                  WHERE categoriies.category NOT IN('OPEN DISH', 'VAT') AND menu_items.item_category_id=".$CategoryId."
                  ORDER BY item_name ASC";
      }
    } else {
      if (strlen($ItemName) > 0 && $ItemName != null) {
        $query = "SELECT menu_items.*, categoriies.category,store_departments.sd_name AS display_name FROM menu_items
                INNER JOIN categoriies ON menu_items.item_category_id=categoriies.category_id
                INNER JOIN store_departments ON store_departments.sd_id=menu_items.display
                WHERE categoriies.category NOT IN('OPEN DISH', 'VAT') AND menu_items.item_name LIKE '%".$ItemName."%'
                ORDER BY item_name ASC LIMIT 50";
      } else if (strlen($ItemName) == 0 || $ItemName == "") {
        $query = "SELECT menu_items.*, categoriies.category,store_departments.sd_name AS display_name FROM menu_items
                  INNER JOIN categoriies ON menu_items.item_category_id=categoriies.category_id
                  INNER JOIN store_departments ON store_departments.sd_id=menu_items.display
                  WHERE categoriies.category NOT IN('OPEN DISH', 'VAT') ORDER BY menu_items.item_name ASC";
      }
      

    }

    

    $menuItems = new stdClass();
    $menuItems->error = false;
    $menuItems->filter = $DepartmentId;
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
      $dbItem->display_name = $Item['display_name'];
      $dbItem->status = (int)$Item['hide'];
      $dbItem->category = $Item['category'];

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
    $Query = mysqli_query($con, "SELECT * FROM categoriies WHERE category NOT IN('OPEN DISH', 'VAT') ORDER BY category ASC");

    while($Cat       = mysqli_fetch_array($Query)) {
      $CatItem       = new stdClass();
      $CatItem->id   = (int)$Cat['category_id'];
      $CatItem->name = $Cat['category'];
      $CatItem->department_id = $Cat['department_id'];
      $CatItem->status = $Cat['status'];
      array_push($Categories, $CatItem);
    }

    $response->error = false;
    $response->data = $Categories;

    echo json_encode($response);

  } else if (isset($_POST['update_item'])) {
    $Itemid     = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_id']));
    $ItemName   = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_name']));
    $Price      = html_entity_decode(mysqli_real_escape_string($con, $_POST['price']));
    $CategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_id']));
    $Display    = html_entity_decode(mysqli_real_escape_string($con, $_POST['display']));

    $UpdateItem = mysqli_query($con, "UPDATE menu_items
      SET item_name='".$ItemName."', item_price=".$Price.",item_category_id=".$CategoryId.",display=".$Display."
      WHERE item_id=".$Itemid." ");

    $response = new stdClass();
    if ($UpdateItem) {
      $response->error = false;
      $response->message = 'Success';
    } else {
      $response->error = true;
      $response->message = 'Something went wrong';
    }

    echo json_encode($response);

  } else if(isset($_POST['create_new_item'])) {
    $response   = new stdClass();
    $Name       = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_name']));
    $CategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_id']));
    $DisplayId  = html_entity_decode(mysqli_real_escape_string($con, $_POST['display']));
    $ItemPrice  = html_entity_decode(mysqli_real_escape_string($con, $_POST['item_price']));
    $CompanyId  = html_entity_decode(mysqli_real_escape_string($con, $_POST['company_id']));

    $Check = mysqli_query($con, "SELECT * FROM menu_items WHERE item_name='".$Name."' AND item_category_id=".$CategoryId." ");
    if (mysqli_num_rows($Check) == 0) {
      $AddItem = mysqli_query($con, "INSERT INTO menu_items(item_name,item_price,item_category_id,display,company_id)
      VALUES('".$Name."',".$ItemPrice.",".$CategoryId.",".$DisplayId.",".$CompanyId.") ");

      if ($AddItem) {
        $response->error = false;
        $response->message = 'Success';
      } else {
        $response->error = true;
        $response->message = 'Sorry, something went wrong. Item was ot created';
      }

    } else {
      $response->error = true;
      $response->message = 'Sorry Item already exists';
    }

    echo json_encode($response);

  } else if (isset($_POST['update_menu_category'])) {
    $response = new stdClass();

    $MenuCategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_id']));
    $Status         = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_status']));

    if ($Status == 0) {
      $UpdateStatus = 1;
    } else {
      $UpdateStatus = 0;
    }

    $Update = mysqli_query($con, "UPDATE categoriies SET status=".$UpdateStatus." WHERE category_id=".$MenuCategoryId." ");
    if ($Update) {
      $response->error = false;
    } else {
      $response->error = true;
      $response->message = "Sorry update failed";
    }
    echo json_encode($response);

  } else if (isset($_POST['update_menu_category_name'])) {
    $response = new stdClass();

    $MenuCategoryId = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_id']));
    $ItemName       = html_entity_decode(mysqli_real_escape_string($con, $_POST['category_name']));

    $Update = mysqli_query($con, "UPDATE categoriies SET category='".$ItemName."' WHERE category_id=".$MenuCategoryId." ");
    if ($Update) {
      $response->error = false;
    } else {
      $response->error = true;
      $response->message = "Sorry update failed ".$MenuCategoryId.".$ItemName.";
    }
    echo json_encode($response);

  } else if(isset($_POST['new_category_name'])) {
    $response = new stdClass();
    $CategoryName = html_entity_decode(mysqli_real_escape_string($con, $_POST['new_category_name']));
    $CompanyId    = html_entity_decode(mysqli_real_escape_string($con, $_POST['company_id']));

    if (strlen($CategoryName) > 0 && strlen($CompanyId) > 0) {
      $CheckCategory = mysqli_query($con, "SELECT * FROM categoriies WHERE category='".$CategoryName."' AND company_id=".$CompanyId." ");
      if (mysqli_num_rows($CheckCategory) == 0) {
        $AddCategory = mysqli_query($con, "INSERT INTO categoriies(category,company_id) VALUES('".$CategoryName."',".$CompanyId.") ");
        if ($AddCategory) {
          $response->error = false;
          $response->message = 'Success';
        } else {
          $response->error = true;
          $response->message = 'Sorry, query insert failed';
        }
      } else {
        $response->error = true;
        $response->message = 'Sorry, Category already exists';
      }

    } else {
      $response->error = true;
      $response->message = 'Missing params';
    }
    echo json_encode($response);
  }
