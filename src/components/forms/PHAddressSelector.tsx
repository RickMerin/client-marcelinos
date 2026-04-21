import { useEffect, useId, useMemo, useReducer } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/lib/storage/localStorage";
import { CountryDropdown } from "./CountryDropdown";  // custom dropdown component
import { LazyMotion, m } from "framer-motion";

type PSGCOption = {
  code: string;
  name: string;
};

type StoredPHAddress = {
  addressType?: "local" | "international";
  internationalAddress?: string;
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  municipalityCode: string;
  municipalityName: string;
  barangayCode: string;
  barangayName: string;
};

const STORAGE_KEY = "reservationDetails.personal.phAddress";

type AddressState = {
  addressType: "local" | "international";
  internationalAddress: string;
  regionCode: string;
  provinceCode: string;
  municipalityCode: string;
  barangayCode: string;
};

type AddressAction =
  | { type: "SET_ADDRESS_TYPE"; addressType: "local" | "international" }
  | { type: "SET_INTERNATIONAL_ADDRESS"; internationalAddress: string }
  | { type: "SET_REGION"; regionCode: string }
  | { type: "SET_PROVINCE"; provinceCode: string }
  | { type: "SET_MUNICIPALITY"; municipalityCode: string }
  | { type: "SET_BARANGAY"; barangayCode: string };

function addressReducer(state: AddressState, action: AddressAction): AddressState {
  switch (action.type) {
    case "SET_ADDRESS_TYPE": {
      if (action.addressType === "local") {
        return {
          ...state,
          addressType: "local",
          internationalAddress: "",
        };
      }

      return {
        ...state,
        addressType: "international",
      };
    }
    case "SET_INTERNATIONAL_ADDRESS":
      return {
        ...state,
        internationalAddress: action.internationalAddress,
      };
    case "SET_REGION":
      return {
        ...state,
        regionCode: action.regionCode,
        provinceCode: "",
        municipalityCode: "",
        barangayCode: "",
      };
    case "SET_PROVINCE":
      return {
        ...state,
        provinceCode: action.provinceCode,
        municipalityCode: "",
        barangayCode: "",
      };
    case "SET_MUNICIPALITY":
      return {
        ...state,
        municipalityCode: action.municipalityCode,
        barangayCode: "",
      };
    case "SET_BARANGAY":
      return {
        ...state,
        barangayCode: action.barangayCode,
      };
    default:
      return state;
  }
}

type AddressTypeToggleProps = {
  addressType: AddressState["addressType"];
  disabled?: boolean;
  radioGroupName: string;
  onSelectLocal: () => void;
  onSelectInternational: () => void;
};

type InternationalAddressFormProps = {
  disabled?: boolean;
  countryInputId: string;
  internationalAddress: string;
  onInternationalAddressChange: (value: string) => void;
};

type LocalAddressFormProps = {
  disabled?: boolean;
  baseSelectClass: string;
  regionCode: string;
  provinceCode: string;
  municipalityCode: string;
  barangayCode: string;
  regions: PSGCOption[];
  provinces: PSGCOption[];
  municipalities: PSGCOption[];
  barangays: PSGCOption[];
  isNCR: boolean;
  onRegionChange: (regionCode: string) => void;
  onProvinceChange: (provinceCode: string) => void;
  onMunicipalityChange: (municipalityCode: string) => void;
  onBarangayChange: (barangayCode: string) => void;
};

function AddressTypeToggle({
  addressType,
  disabled,
  radioGroupName,
  onSelectLocal,
  onSelectInternational,
}: AddressTypeToggleProps) {
  return (
    <div className="inline-flex space-x-2">
      <label className="cursor-pointer">
        <input
          type="radio"
          className="sr-only"
          name={radioGroupName}
          value="local"
          checked={addressType === "local"}
          onChange={onSelectLocal}
          disabled={disabled}
        />
        <m.span
          className="px-5 py-2 text-sm sm:text-base rounded-full"
          animate={{
            backgroundColor:
              addressType === "local" ? "var(--color-primary)" : "transparent",
            color:
              addressType === "local"
                ? "var(--color-primary-foreground)"
                : "var(--color-foreground)",
            scale: addressType === "local" ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          Local
        </m.span>
      </label>

      <label className="cursor-pointer">
        <input
          type="radio"
          className="sr-only"
          name={radioGroupName}
          value="international"
          checked={addressType === "international"}
          onChange={onSelectInternational}
          disabled={disabled}
        />
        <m.span
          className="px-5 py-2 text-sm sm:text-base rounded-full"
          animate={{
            backgroundColor:
              addressType === "international"
                ? "var(--color-primary)"
                : "transparent",
            color:
              addressType === "international"
                ? "var(--color-primary-foreground)"
                : "var(--color-foreground)",
            scale: addressType === "international" ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          Foreign
        </m.span>
      </label>
    </div>
  );
}

function InternationalAddressForm({
  disabled,
  countryInputId,
  internationalAddress,
  onInternationalAddressChange,
}: InternationalAddressFormProps) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium" htmlFor={countryInputId}>
        Country <span className="text-red-500">*</span>
      </label>
      <CountryDropdown
        id={countryInputId}
        value={internationalAddress}
        onChange={onInternationalAddressChange}
        disabled={disabled}
      />
    </div>
  );
}

function LocalAddressForm({
  disabled,
  baseSelectClass,
  regionCode,
  provinceCode,
  municipalityCode,
  barangayCode,
  regions,
  provinces,
  municipalities,
  barangays,
  isNCR,
  onRegionChange,
  onProvinceChange,
  onMunicipalityChange,
  onBarangayChange,
}: LocalAddressFormProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          <span>
            Region <span className="text-red-500">*</span>
          </span>
          <select
            value={regionCode}
            onChange={(e) => onRegionChange(e.target.value)}
            disabled={disabled}
            className={baseSelectClass}
          >
            <option value="">Select region</option>
            {regions.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          <span>
            Province <span className="text-red-500">*</span>
          </span>
          <select
            value={provinceCode}
            onChange={(e) => onProvinceChange(e.target.value)}
            disabled={disabled || !regionCode || isNCR}
            className={baseSelectClass}
          >
            <option value="">Select province</option>
            {provinces.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          <span>
            Municipality <span className="text-red-500">*</span>
          </span>
          <select
            value={municipalityCode}
            onChange={(e) => onMunicipalityChange(e.target.value)}
            disabled={disabled || (!provinceCode && !isNCR)}
            className={baseSelectClass}
          >
            <option value="">Select municipality</option>
            {municipalities.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          <span>
            Barangay <span className="text-red-500">*</span>
          </span>
          <select
            value={barangayCode}
            onChange={(e) => onBarangayChange(e.target.value)}
            disabled={disabled || !municipalityCode}
            className={baseSelectClass}
          >
            <option value="">Select barangay</option>
            {barangays.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

type Props = {
  value: string;
  onChange: (nextAddress: string) => void;
  onAddressTypeChange?: (addressType: "local" | "international") => void;
  disabled?: boolean;
};

const sortByName = (items: PSGCOption[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export function PHAddressSelector({
  value,
  onChange,
  onAddressTypeChange,
  disabled,
}: Props) {
  const stored = useMemo(() => {
    const raw = getFromLocalStorage(STORAGE_KEY);
    return raw as StoredPHAddress | null;
  }, []);

  const radioGroupName = useId();
  const countryInputId = useId();

  const [state, dispatch] = useReducer(addressReducer, {
    addressType: stored?.addressType ?? "local",
    internationalAddress: stored?.internationalAddress ?? "",
    regionCode: stored?.regionCode ?? "",
    provinceCode: stored?.provinceCode ?? "",
    municipalityCode: stored?.municipalityCode ?? "",
    barangayCode: stored?.barangayCode ?? "",
  });

  const {
    addressType,
    internationalAddress,
    regionCode,
    provinceCode,
    municipalityCode,
    barangayCode,
  } = state;

  const isNCR: boolean = regionCode === "130000000";

  const { data: regionsData } = useQuery({
    queryKey: ["psgc", "regions"],
    queryFn: async () => {
      const res = await fetch("https://psgc.gitlab.io/api/regions/");
      const data: PSGCOption[] = await res.json();
      return sortByName(data);
    },
  });

  const { data: provincesData } = useQuery({
    queryKey: ["psgc", "regions", regionCode, "provinces"],
    queryFn: async () => {
      const res = await fetch(
        `https://psgc.gitlab.io/api/regions/${regionCode}/provinces`,
      );
      const data: PSGCOption[] = await res.json();
      return sortByName(data);
    },
    enabled: !!regionCode,
  });

  const { data: municipalitiesData } = useQuery({
    queryKey: isNCR
      ? ["psgc", "regions", regionCode, "cities-municipalities"]
      : ["psgc", "provinces", provinceCode, "cities-municipalities"],
    queryFn: async () => {
      const url = isNCR
        ? `https://psgc.gitlab.io/api/regions/${regionCode}/cities-municipalities`
        : `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities`;
      const res = await fetch(url);
      const data: PSGCOption[] = await res.json();
      return sortByName(data);
    },
    enabled: !!regionCode && (!!provinceCode || isNCR),
  });

  const { data: barangaysData } = useQuery({
    queryKey: ["psgc", "cities-municipalities", municipalityCode, "barangays"],
    queryFn: async () => {
      const res = await fetch(
        `https://psgc.gitlab.io/api/cities-municipalities/${municipalityCode}/barangays`,
      );
      const data: PSGCOption[] = await res.json();
      return sortByName(data);
    },
    enabled: !!municipalityCode,
  });

  const regions = regionsData ?? [];
  const provinces = regionCode ? (provincesData ?? []) : [];
  const municipalities =
    provinceCode || isNCR ? (municipalitiesData ?? []) : [];
  const barangays = municipalityCode ? (barangaysData ?? []) : [];

  const selectedRegion = useMemo(
    () => regions.find((r) => r.code === regionCode) ?? null,
    [regions, regionCode],
  );
  const selectedProvince = useMemo(
    () => provinces.find((p) => p.code === provinceCode) ?? null,
    [provinces, provinceCode],
  );
  const selectedMunicipality = useMemo(
    () => municipalities.find((m) => m.code === municipalityCode) ?? null,
    [municipalities, municipalityCode],
  );
  const selectedBarangay = useMemo(
    () => barangays.find((b) => b.code === barangayCode) ?? null,
    [barangays, barangayCode],
  );

  const computedAddress = useMemo(() => {
    if (
      !selectedRegion?.name ||
      (!isNCR && !selectedProvince?.name) ||
      !selectedMunicipality?.name ||
      !selectedBarangay?.name
    ) {
      return "";
    }

    if (isNCR) {
      return `${selectedBarangay.name}, ${selectedMunicipality.name}, ${selectedRegion.name}`;
    } else {
      return `${selectedBarangay.name}, ${selectedMunicipality.name}, ${selectedProvince?.name}, ${selectedRegion.name}`;
    }
  }, [
    selectedBarangay?.name,
    selectedMunicipality?.name,
    selectedProvince?.name,
    selectedRegion?.name,
    isNCR,
  ]);

  // Keep RHF field in sync with the computed address.
  useEffect(() => {
    if (addressType !== "local") return;

    if ((value ?? "") !== computedAddress) {
      onChange(computedAddress);
    }
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [computedAddress, addressType]);

  // Keep RHF field in sync with the international input.
  useEffect(() => {
    if (addressType !== "international") return;
    if ((value ?? "") !== internationalAddress) {
      onChange(internationalAddress);
    }
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [internationalAddress, addressType]);

  useEffect(() => {
    if (isNCR) {
      dispatch({ type: "SET_PROVINCE", provinceCode: "" });
    }
  }, [regionCode]);

  // Persist selection (codes + names) so reload restores dropdowns.
  useEffect(() => {
    const payload: StoredPHAddress = {
      addressType,
      internationalAddress,
      regionCode,
      regionName: selectedRegion?.name ?? "",
      provinceCode,
      provinceName: selectedProvince?.name ?? "",
      municipalityCode,
      municipalityName: selectedMunicipality?.name ?? "",
      barangayCode,
      barangayName: selectedBarangay?.name ?? "",
    };

    saveToLocalStorage(STORAGE_KEY, payload);
  }, [
    addressType,
    internationalAddress,
    regionCode,
    provinceCode,
    municipalityCode,
    barangayCode,
    selectedRegion?.name,
    selectedProvince?.name,
    selectedMunicipality?.name,
    selectedBarangay?.name,
  ]);

  const baseSelectClass =
    "h-10 w-full rounded-md border px-3 disabled:opacity-50";

  const handleSelectLocal = () => {
    dispatch({ type: "SET_ADDRESS_TYPE", addressType: "local" });
    onAddressTypeChange?.("local");
    onChange(computedAddress);
  };

  const handleSelectInternational = () => {
    dispatch({
      type: "SET_ADDRESS_TYPE",
      addressType: "international",
    });
    onAddressTypeChange?.("international");
    onChange(internationalAddress);
  };

  return (
    <div className="space-y-4">
      <LazyMotion
        features={() => import("framer-motion").then((res) => res.domAnimation)}
      >
        <AddressTypeToggle
          addressType={addressType}
          disabled={disabled}
          radioGroupName={radioGroupName}
          onSelectLocal={handleSelectLocal}
          onSelectInternational={handleSelectInternational}
        />
      </LazyMotion>

      {addressType === "international" ? (
        <InternationalAddressForm
          disabled={disabled}
          countryInputId={countryInputId}
          internationalAddress={internationalAddress}
          onInternationalAddressChange={(next) =>
            dispatch({
              type: "SET_INTERNATIONAL_ADDRESS",
              internationalAddress: next,
            })
          }
        />
      ) : (
        <LocalAddressForm
          disabled={disabled}
          baseSelectClass={baseSelectClass}
          regionCode={regionCode}
          provinceCode={provinceCode}
          municipalityCode={municipalityCode}
          barangayCode={barangayCode}
          regions={regions}
          provinces={provinces}
          municipalities={municipalities}
          barangays={barangays}
          isNCR={isNCR}
          onRegionChange={(next) =>
            dispatch({ type: "SET_REGION", regionCode: next })
          }
          onProvinceChange={(next) =>
            dispatch({ type: "SET_PROVINCE", provinceCode: next })
          }
          onMunicipalityChange={(next) =>
            dispatch({ type: "SET_MUNICIPALITY", municipalityCode: next })
          }
          onBarangayChange={(next) =>
            dispatch({ type: "SET_BARANGAY", barangayCode: next })
          }
        />
      )}
    </div>
  );
}
