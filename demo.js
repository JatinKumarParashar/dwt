var DWObject, deviceList;
function Dynamsoft_OnReady() {
  DWObject = Dynamsoft.DWT.GetWebTwain("dwtcontrolContainer"); // Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
  DWObject.RegisterEvent("OnPostTransferAsync", function () {
    var index = DWObject.CurrentImageIndexInBuffer;
    if (DWObject.IsBlankImage(index)) DWObject.RemoveImage(index);
  });
  if (DWObject) {
    deviceList = [];
    DWObject.GetDevicesAsync()
      .then(function (devices) {
        for (var i = 0; i < devices.length; i++) {
          // Get how many sources are installed in the system
          document
            .getElementById("source")
            .options.add(new Option(devices[i].displayName, i)); // Add the sources in a drop-down list
          deviceList.push(devices[i]);
        }
      })
      .catch(function (exp) {
        alert(exp.message);
      });
  }
}

function LoadImage() {
  if (DWObject) {
    DWObject.IfShowFileDialog = true; // Open the system's file dialog to load image
    DWObject.LoadImageEx(
      "",
      Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
      OnSuccess,
      OnFailure
    ); // Load images in all supported formats (.bmp, .jpg, .tif, .png, .pdf). OnSuccess or OnFailure will be called after the operation
  }
}

function AcquireImage() {
  if (DWObject) {
    var i,
      iPixelType = 0;
    for (i = 0; i < 3; i++) {
      if (document.getElementsByName("PixelType").item(i).checked == true)
        iPixelType = i;
    }
    var ddlSource = document.getElementById("source");
    if (ddlSource) {
      DWObject.SelectDeviceAsync(deviceList[ddlSource.selectedIndex])
        .then(function () {
          return DWObject.AcquireImageAsync({
            IfShowUI: document.getElementById("ShowUI").checked,
            PixelType: iPixelType,
            Resolution: document.getElementById("Resolution").value,
            IfFeederEnabled: document.getElementById("ADF").checked,
            IfDisableSourceAfterAcquire: true, // Scanner source will be disabled/closed automatically after the scan.
          });
        })
        .then(function () {
          return DWObject.CloseSourceAsync();
        })
        .catch(function (exp) {
          alert(exp.message);
        });
    }
  }
  SaveWithFileDialog();
}

function SaveAsDifferentfile() {
  if (DWObject) {
    if (DWObject.HowManyImagesInBuffer > 0) {
      for (let i = 1; i <= DWObject.HowManyImagesInBuffer; i++) {
        DWObject.IfShowFileDialog = true;
        DWObject.SaveAllAsPDF(`image_${i}.pdf`, OnSuccess, OnFailure);
      }
    }
  }
}

function SaveWithFileDialog() {
  if (DWObject) {
    if (DWObject.HowManyImagesInBuffer > 0) {
      console.log(DWObject.HowManyImagesInBuffer);
      DWObject.IfShowFileDialog = true;
      DWObject.SaveAllAsPDF("DynamicWebTWAIN.pdf", OnSuccess, OnFailure);
    }
  }
}

function removeBlankPages() {
  DWObject.Capability = Dynamsoft.DWT.EnumDWT_Cap.ICAP_AUTODISCARDBLANKPAGES;
  DWObject.CapType = Dynamsoft.DWT.EnumDWT_CapType.TWON_ONEVALUE;
  DWObject.CapValue = -1; //Auto
  if (DWObject.CapSet) {
    alert("Successful!");
  }
}

function OnSuccess() {
  console.log("successful");
}
function OnFailure(errorCode, errorString) {
  alert(errorString);
}
