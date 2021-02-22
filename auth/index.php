<?php
  include('../conf/db_connection.php');

  if ((isset($_POST['username']) && isset($_POST['password'])) || isset($_POST['auth_by_id']) ) {
    $Username = html_entity_decode(mysqli_real_escape_string($con, $_POST['username']));
    $Password = html_entity_decode(mysqli_real_escape_string($con, $_POST['password']));
    $object = new stdClass();

    if ($_POST['auth_by_id']) { // Auth by user Id
      $UserID = html_entity_decode(mysqli_real_escape_string($con, $_POST['auth_by_id']));
      $query = mysqli_query($con, "SELECT pos_companies.user_id, pos_companies.user_name, pos_companies.user_role,company.* FROM pos_companies INNER JOIN company ON pos_companies.company_id=company.company_id WHERE pos_companies.user_id='".$UserID."' AND pos_companies.is_active=1");
    } else { // Auth by username and password
      $query = mysqli_query($con, "SELECT pos_companies.user_id, pos_companies.user_name, pos_companies.user_role,company.* FROM pos_companies INNER JOIN company ON pos_companies.company_id=company.company_id WHERE pos_companies.user_name='".$Username."' AND pos_companies.user_key='".$Password."' AND pos_companies.is_active=1");
    }
    
    $UserCount = (int)mysqli_num_rows($query);

    if ($UserCount == 0) {
      $object->error = true;
      $object->message = 'Sorry, username and password provided do not match.';
    } else {
      $UserData = mysqli_fetch_array($query);
      $object->error = false;
      $authData = new stdClass();
      $authData->id = (int)$UserData[user_id];
      $authData->user_name = $UserData[user_name];
      $authData->role = (int)$UserData[user_role];
      $authData->company_id = (int)$UserData[company_id];

      //Get day open
      $DBDay      = mysqli_query($con, "SELECT MAX(day_open) AS System_Opener FROM day_open LIMIT 1 ");
      $FetchDay   = mysqli_fetch_array($DBDay);
      $DayOpen    = $FetchDay['System_Opener'];

      // Days left
      $CheckStatus = mysqli_query($license, "SELECT date_end FROM licences ORDER BY license_id DESC LIMIT 1 ");
      $DbState     = mysqli_fetch_array($CheckStatus);
      $LastDate    = $DbState['date_end'];
      $mToday       = date('Y-m-d');
      $DifferenceInDays = (int)round((strtotime($LastDate) - strtotime($mToday))/(3600*24));

      //TOTAL SALE
      $mTotalSaleCumm = 0;
      $TotalSale = mysqli_query($con, "SELECT SUM(order_settements.amount_settled) AS total_sale FROM order_settements INNER JOIN client_orders ON client_orders.order_id = order_settements.order_id WHERE order_settements.settlement_type IN(1,2,4,10,11,12) AND client_orders.date='".$DayOpen."' ");
      $mTotalSale = mysqli_fetch_array($TotalSale);
      $TotalSale = number_format($mTotalSale['total_sale']);

      // User company
      $companyInfo = new stdClass();
      $companyInfo->company_id = (int)$UserData[company_id];
      $companyInfo->company_name = $UserData[company_name];
      $companyInfo->company_location = $UserData[company_location];
      $companyInfo->company_mobile = $UserData[company_mobile];
      $companyInfo->company_email = $UserData[email_address];
      $companyInfo->company_tin = $UserData[tin];
      $companyInfo->company_receipt = $UserData[receipt];
      $companyInfo->company_currency = $UserData[currency];
      $companyInfo->day_open = $DayOpen;
      $companyInfo->day_open_display = date('d M, Y', strtotime($DayOpen));
      $companyInfo->days_left = $DifferenceInDays;
      $companyInfo->total_sale = $TotalSale;

      $authData->company_info = $companyInfo;

      $object->data = $authData;
    }
    echo json_encode($object);
  }
