import { Select } from "antd";
import React, { useState, useEffect } from "react";
import { getTeamList } from "../../team/api";

interface Props {
  value?: number;
  is_manager: boolean;
  onChange: (value: number) => void;
}
const TeamSelect = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const result: any = await getTeamList({ is_manager: props.is_manager });
    if (result.code === 0) {
      result.data.forEach((team: any) => {
        team.value = team.team_id;
        team.label = team.name;
      });
      setList(result.data);
      result.data && result.data[0] && props.onChange(result.data[0].value);
    }
    setLoading(false);
  };

  return (
    <Select
      style={{ width: "100%", height: "100%" }}
      value={props.value}
      onChange={(value) => props.onChange(value)}
      options={list}
      placeholder="请选择团队"
    />
  );
};

export default TeamSelect;
