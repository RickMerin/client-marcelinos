import { useEffect, useId, useMemo, useState } from "react";

import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "@/lib/storage/localStorage";
import { Input } from "@/components/ui/input";

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

type Props = {
  value: string;
  onChange: (nextAddress: string) => void;
  disabled?: boolean;
};

const sortByName = (items: PSGCOption[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export function PHAddressSelector({ value, onChange, disabled }: Props) {
  const stored = useMemo(() => {
    const raw = getFromLocalStorage(STORAGE_KEY);
    return raw as StoredPHAddress | null;
  }, []);

  const radioGroupName = useId();

  const [addressType, setAddressType] = useState<
    "local" | "international"
  >(stored?.addressType ?? "local");
  const [internationalAddress, setInternationalAddress] = useState<string>(
    stored?.internationalAddress ?? "",
  );

  const [regions, setRegions] = useState<PSGCOption[]>([]);
  const [provinces, setProvinces] = useState<PSGCOption[]>([]);
  const [municipalities, setMunicipalities] = useState<PSGCOption[]>([]);
  const [barangays, setBarangays] = useState<PSGCOption[]>([]);

  const [regionCode, setRegionCode] = useState<string>(stored?.regionCode ?? "");
  const [provinceCode, setProvinceCode] = useState<string>(
    stored?.provinceCode ?? "",
  );
  const [municipalityCode, setMunicipalityCode] = useState<string>(
    stored?.municipalityCode ?? "",
  );
  const [barangayCode, setBarangayCode] = useState<string>(
    stored?.barangayCode ?? "",
  );

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
      !selectedProvince?.name ||
      !selectedMunicipality?.name ||
      !selectedBarangay?.name
    ) {
      return "";
    }

    return `${selectedBarangay.name}, ${selectedMunicipality.name}, ${selectedProvince.name}, ${selectedRegion.name}`;
  }, [
    selectedBarangay?.name,
    selectedMunicipality?.name,
    selectedProvince?.name,
    selectedRegion?.name,
  ]);

  // Keep RHF field in sync with the computed address.
  useEffect(() => {
    if (addressType !== "local") return;

    if ((value ?? "") !== computedAddress) {
      onChange(computedAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedAddress, addressType]);

  // Keep RHF field in sync with the international input.
  useEffect(() => {
    if (addressType !== "international") return;
    if ((value ?? "") !== internationalAddress) {
      onChange(internationalAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internationalAddress, addressType]);

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

  // Fetch regions once.
  useEffect(() => {
    let cancelled = false;

    fetch("https://psgc.gitlab.io/api/regions/")
      .then((res) => res.json())
      .then((data: PSGCOption[]) => {
        if (cancelled) return;
        setRegions(sortByName(data));
      })
      .catch(() => {
        if (cancelled) return;
        setRegions([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch provinces when region changes.
  useEffect(() => {
    if (!regionCode) {
      setProvinces([]);
      return;
    }

    let cancelled = false;

    fetch(`https://psgc.gitlab.io/api/regions/${regionCode}/provinces`)
      .then((res) => res.json())
      .then((data: PSGCOption[]) => {
        if (cancelled) return;
        setProvinces(sortByName(data));
      })
      .catch(() => {
        if (cancelled) return;
        setProvinces([]);
      });

    return () => {
      cancelled = true;
    };
  }, [regionCode]);

  // Fetch municipalities when province changes.
  useEffect(() => {
    if (!provinceCode) {
      setMunicipalities([]);
      return;
    }

    let cancelled = false;

    fetch(
      `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities`,
    )
      .then((res) => res.json())
      .then((data: PSGCOption[]) => {
        if (cancelled) return;
        setMunicipalities(sortByName(data));
      })
      .catch(() => {
        if (cancelled) return;
        setMunicipalities([]);
      });

    return () => {
      cancelled = true;
    };
  }, [provinceCode]);

  // Fetch barangays when municipality changes.
  useEffect(() => {
    if (!municipalityCode) {
      setBarangays([]);
      return;
    }

    let cancelled = false;

    fetch(
      `https://psgc.gitlab.io/api/cities-municipalities/${municipalityCode}/barangays`,
    )
      .then((res) => res.json())
      .then((data: PSGCOption[]) => {
        if (cancelled) return;
        setBarangays(sortByName(data));
      })
      .catch(() => {
        if (cancelled) return;
        setBarangays([]);
      });

    return () => {
      cancelled = true;
    };
  }, [municipalityCode]);

  const baseSelectClass =
    "h-10 w-full rounded-md border px-3 disabled:opacity-50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={radioGroupName}
            value="local"
            checked={addressType === "local"}
            onChange={() => {
              setAddressType("local");
              setInternationalAddress("");
              onChange(computedAddress);
            }}
            disabled={disabled}
          />
          <span className="text-sm sm:text-base">Local</span>
        </label>

        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name={radioGroupName}
            value="international"
            checked={addressType === "international"}
            onChange={() => {
              setAddressType("international");
              onChange(internationalAddress);
            }}
            disabled={disabled}
          />
          <span className="text-sm sm:text-base">International</span>
        </label>
      </div>

      {addressType === "international" ? (
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">
            Country / Full Address <span className="text-red-500">*</span>
          </label>
          <Input
            value={internationalAddress}
            onChange={(e) => setInternationalAddress(e.target.value)}
            placeholder="Enter country or full address"
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          Region <span className="text-red-500">*</span>
        </label>
        <select
          value={regionCode}
          onChange={(e) => {
            const next = e.target.value;
            setRegionCode(next);
            setProvinceCode("");
            setMunicipalityCode("");
            setBarangayCode("");
          }}
          disabled={disabled}
          className={baseSelectClass}>
          <option value="">Select region</option>
          {regions.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          Province <span className="text-red-500">*</span>
        </label>
        <select
          value={provinceCode}
          onChange={(e) => {
            const next = e.target.value;
            setProvinceCode(next);
            setMunicipalityCode("");
            setBarangayCode("");
          }}
          disabled={disabled || !regionCode}
          className={baseSelectClass}>
          <option value="">Select province</option>
          {provinces.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          Municipality <span className="text-red-500">*</span>
        </label>
        <select
          value={municipalityCode}
          onChange={(e) => {
            const next = e.target.value;
            setMunicipalityCode(next);
            setBarangayCode("");
          }}
          disabled={disabled || !provinceCode}
          className={baseSelectClass}>
          <option value="">Select municipality</option>
          {municipalities.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium">
          Barangay <span className="text-red-500">*</span>
        </label>
        <select
          value={barangayCode}
          onChange={(e) => setBarangayCode(e.target.value)}
          disabled={disabled || !municipalityCode}
          className={baseSelectClass}>
          <option value="">Select barangay</option>
          {barangays.map((opt) => (
            <option key={opt.code} value={opt.code}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>
        </div>
      )}
    </div>
  );
}
